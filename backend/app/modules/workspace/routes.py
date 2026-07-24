from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db_session
from app.models.auth import User
from app.modules.auth.dependencies import require_permission

router = APIRouter(tags=["workspace"])
CanViewFirs = Annotated[User, Depends(require_permission("firs:view"))]
DbSession = Annotated[AsyncSession, Depends(get_db_session)]


def rows(result: Any) -> list[dict[str, Any]]:
    return [dict(item) for item in result.mappings().all()]


@router.get("/firs")
async def list_firs(
    _: CanViewFirs,
    session: DbSession,
    search: str | None = None,
    limit: int = Query(default=100, ge=1, le=500),
) -> list[dict[str, Any]]:
    query = text(
        """
        select f.id::text,
               f.crime_number as number,
               coalesce(ch.name::text, 'FIR ' || f.crime_number) as title,
               coalesce(f.brief_facts, '') as summary,
               pu.name::text as station,
               coalesce(d.name::text, '') as district,
               coalesce(o.first_name, 'Unassigned') as officer,
               case
                 when lower(coalesce(g.name::text, '')) like '%grave%' then 'critical'
                 when lower(coalesce(g.name::text, '')) like '%serious%' then 'high'
                 else 'medium'
               end as priority,
               lower(coalesce(cs.name::text, 'registered')) as status,
               f.registered_at as "registeredAt",
               f.updated_at as "updatedAt",
               coalesce(array_agg(distinct cp.person_id::text)
                 filter (where cp.person_id is not null), '{}') as "personIds",
               count(distinct cp.id)::int as "relationshipCount"
        from firs f
        join police_units pu on pu.id = f.police_station_id
        left join districts d on d.id = pu.district_id
        left join officers o on o.id = f.investigating_officer_id
        left join gravity_offences g on g.id = f.gravity_id
        left join case_statuses cs on cs.id = f.status_id
        left join crime_heads ch on ch.id = f.crime_head_id
        left join case_parties cp on cp.fir_id = f.id
        where (:search is null
          or f.crime_number ilike '%' || :search || '%'
          or f.brief_facts ilike '%' || :search || '%')
        group by f.id, ch.name, pu.name, d.name, o.first_name, g.name, cs.name
        order by f.registered_at desc
        limit :limit
        """
    )
    result = await session.execute(query, {"search": search, "limit": limit})
    return rows(result)


@router.get("/firs/{fir_id}")
async def get_fir(fir_id: int, _: CanViewFirs, session: DbSession) -> dict[str, Any]:
    result = await session.execute(
        text(
            """
            select f.*, pu.name::text as station, d.name::text as district,
                   o.first_name as officer
            from firs f
            join police_units pu on pu.id = f.police_station_id
            left join districts d on d.id = pu.district_id
            left join officers o on o.id = f.investigating_officer_id
            where f.id = :id
            """
        ),
        {"id": fir_id},
    )
    item = result.mappings().one_or_none()
    if item is None:
        raise HTTPException(404, "FIR not found")
    return dict(item)


@router.get("/persons")
async def list_persons(
    _: CanViewFirs,
    session: DbSession,
    search: str | None = None,
    limit: int = Query(default=100, ge=1, le=500),
) -> list[dict[str, Any]]:
    result = await session.execute(
        text(
            """
            select p.id::text, p.canonical_name as name, p.age_years as age,
                   p.gender::text, lower(coalesce(min(cp.role::text), 'complainant')) as role,
                   coalesce(array_agg(distinct pa.alias)
                     filter (where pa.alias is not null), '{}') as aliases,
                   coalesce(array_agg(distinct cp.fir_id::text)
                     filter (where cp.fir_id is not null), '{}') as "firIds",
                   p.created_at as "lastActivity"
            from persons p
            left join person_aliases pa on pa.person_id = p.id
            left join case_parties cp on cp.person_id = p.id
            where (:search is null
              or p.canonical_name ilike '%' || :search || '%'
              or pa.alias ilike '%' || :search || '%')
            group by p.id
            order by p.canonical_name
            limit :limit
            """
        ),
        {"search": search, "limit": limit},
    )
    return rows(result)


@router.get("/persons/{person_id}")
async def get_person(person_id: int, _: CanViewFirs, session: DbSession) -> dict[str, Any]:
    result = await session.execute(
        text("select * from persons where id = :id"), {"id": person_id}
    )
    item = result.mappings().one_or_none()
    if item is None:
        raise HTTPException(404, "Person not found")
    return dict(item)


@router.get("/dashboard")
async def dashboard(_: CanViewFirs, session: DbSession) -> dict[str, Any]:
    result = await session.execute(
        text(
            """
            select
              (select count(*) from firs)::int as "totalFirs",
              (select count(*) from persons)::int as "totalPersons",
              (select count(*) from evidence)::int as "totalEvidence",
              (select count(*) from ai_queries where status = 'pending')::int
                as "pendingAiQueries",
              (select count(*) from audit_events)::int as "auditEvents"
            """
        )
    )
    return dict(result.mappings().one())


@router.get("/reference/districts")
async def districts(_: CanViewFirs, session: DbSession) -> list[dict[str, Any]]:
    return rows(
        await session.execute(
            text("select id, name::text from districts where is_active order by name")
        )
    )


@router.get("/activity")
async def activity(_: CanViewFirs, session: DbSession) -> list[dict[str, Any]]:
    return rows(
        await session.execute(
            text(
                """
                select id::text, occurred_at as time, action, result,
                       metadata as detail
                from audit_events
                order by occurred_at desc
                limit 100
                """
            )
        )
    )


@router.get("/graph")
async def graph(_: CanViewFirs, session: DbSession) -> dict[str, Any]:
    nodes = rows(
        await session.execute(
            text(
                """
                select 'fir' as kind, id::text, crime_number as label from firs
                union all
                select 'person', id::text, canonical_name from persons
                limit 1000
                """
            )
        )
    )
    edges = rows(
        await session.execute(
            text(
                """
                select fir_id::text as source, person_id::text as target,
                       lower(role::text) as label
                from case_parties
                limit 2000
                """
            )
        )
    )
    return {"nodes": nodes, "edges": edges}
