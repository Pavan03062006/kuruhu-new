import enum
import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import BigInteger, Boolean, CheckConstraint, Computed, Date, DateTime, Enum, ForeignKey, Integer, JSON, Numeric, SmallInteger, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class GenderCode(str, enum.Enum):
    M = "M"
    F = "F"
    T = "T"
    O = "O"  # noqa: E741 - official SCRB gender code
    U = "U"


class PartyRole(str, enum.Enum):
    ACCUSED = "ACCUSED"
    VICTIM = "VICTIM"
    COMPLAINANT = "COMPLAINANT"


class State(Base):
    __tablename__ = "states"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    source_state_id: Mapped[int | None] = mapped_column(BigInteger, unique=True)
    name: Mapped[str] = mapped_column(String(255), unique=True)
    nationality_id: Mapped[int | None] = mapped_column(BigInteger)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class District(Base):
    __tablename__ = "districts"
    __table_args__ = (UniqueConstraint("state_id", "name"),)
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    source_district_id: Mapped[int | None] = mapped_column(BigInteger, unique=True)
    state_id: Mapped[int] = mapped_column(ForeignKey("states.id"))
    name: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class UnitType(Base):
    __tablename__ = "unit_types"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    source_unit_type_id: Mapped[int | None] = mapped_column(BigInteger, unique=True)
    name: Mapped[str] = mapped_column(String(255), unique=True)
    jurisdiction_level: Mapped[str | None] = mapped_column(String(32))
    hierarchy_level: Mapped[int | None] = mapped_column(SmallInteger)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class PoliceUnit(Base):
    __tablename__ = "police_units"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    source_unit_id: Mapped[int | None] = mapped_column(BigInteger, unique=True)
    name: Mapped[str] = mapped_column(String(255))
    unit_type_id: Mapped[int] = mapped_column(ForeignKey("unit_types.id"))
    parent_unit_id: Mapped[int | None] = mapped_column(ForeignKey("police_units.id"))
    state_id: Mapped[int | None] = mapped_column(ForeignKey("states.id"))
    district_id: Mapped[int | None] = mapped_column(ForeignKey("districts.id"))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class CaseCategory(Base):
    __tablename__ = "case_categories"
    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True)


class CaseStatus(Base):
    __tablename__ = "case_statuses"
    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True)


class GravityOffence(Base):
    __tablename__ = "gravity_offences"
    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True)


class CrimeHead(Base):
    __tablename__ = "crime_heads"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class CrimeSubHead(Base):
    __tablename__ = "crime_sub_heads"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    crime_head_id: Mapped[int] = mapped_column(ForeignKey("crime_heads.id"))
    name: Mapped[str] = mapped_column(String(255))
    sequence_no: Mapped[int | None] = mapped_column(Integer)


class Occupation(Base):
    __tablename__ = "occupations"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True)


class Religion(Base):
    __tablename__ = "religions"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True)


class Caste(Base):
    __tablename__ = "castes"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True)


class Rank(Base):
    __tablename__ = "ranks"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True)
    hierarchy: Mapped[int | None] = mapped_column(SmallInteger)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Designation(Base):
    __tablename__ = "designations"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True)
    sort_order: Mapped[int | None] = mapped_column(SmallInteger)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Court(Base):
    __tablename__ = "courts"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    source_court_id: Mapped[int | None] = mapped_column(BigInteger, unique=True)
    district_id: Mapped[int | None] = mapped_column(ForeignKey("districts.id"))
    state_id: Mapped[int | None] = mapped_column(ForeignKey("states.id"))
    name: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Act(Base):
    __tablename__ = "acts"
    code: Mapped[str] = mapped_column(String(32), primary_key=True)
    description: Mapped[str] = mapped_column(Text)
    short_name: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class StatutorySection(Base):
    __tablename__ = "statutory_sections"
    __table_args__ = (UniqueConstraint("act_code", "section_code"),)
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    act_code: Mapped[str] = mapped_column(ForeignKey("acts.code"))
    section_code: Mapped[str] = mapped_column(String(64))
    description: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Officer(Base):
    __tablename__ = "officers"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    source_employee_id: Mapped[int | None] = mapped_column(BigInteger, unique=True)
    kgid: Mapped[str | None] = mapped_column(String(64), unique=True)
    district_id: Mapped[int | None] = mapped_column(ForeignKey("districts.id"))
    unit_id: Mapped[int | None] = mapped_column(ForeignKey("police_units.id"))
    rank_id: Mapped[int | None] = mapped_column(ForeignKey("ranks.id"))
    designation_id: Mapped[int | None] = mapped_column(ForeignKey("designations.id"))
    first_name: Mapped[str] = mapped_column(Text)
    date_of_birth: Mapped[date | None] = mapped_column(Date)
    gender: Mapped[GenderCode] = mapped_column(Enum(GenderCode), default=GenderCode.U)
    appointment_date: Mapped[date | None] = mapped_column(Date)


class Fir(Base, TimestampMixin):
    __tablename__ = "firs"
    __table_args__ = (
        CheckConstraint("incident_to IS NULL OR incident_from IS NULL OR incident_to >= incident_from", name="incident_range"),
        UniqueConstraint("police_station_id", "crime_number"),
    )
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    source_case_master_id: Mapped[int] = mapped_column(BigInteger, unique=True)
    crime_number: Mapped[str] = mapped_column(String(64), index=True)
    case_number: Mapped[str | None] = mapped_column(String(64))
    registered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    investigating_officer_id: Mapped[int | None] = mapped_column(ForeignKey("officers.id"))
    police_station_id: Mapped[int] = mapped_column(ForeignKey("police_units.id"), index=True)
    category_id: Mapped[int | None] = mapped_column(ForeignKey("case_categories.id"))
    gravity_id: Mapped[int | None] = mapped_column(ForeignKey("gravity_offences.id"))
    crime_head_id: Mapped[int | None] = mapped_column(ForeignKey("crime_heads.id"), index=True)
    crime_sub_head_id: Mapped[int | None] = mapped_column(ForeignKey("crime_sub_heads.id"))
    status_id: Mapped[int | None] = mapped_column(ForeignKey("case_statuses.id"), index=True)
    court_id: Mapped[int | None] = mapped_column(ForeignKey("courts.id"))
    incident_from: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    incident_to: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    information_received_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    latitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    longitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    brief_facts: Mapped[str | None] = mapped_column(Text)
    source_file: Mapped[str] = mapped_column(String(255), default="CaseMaster.csv")
    source_row_number: Mapped[int] = mapped_column(BigInteger)
    source_payload: Mapped[dict[str, Any]] = mapped_column(JSON)
    parties: Mapped[list["CaseParty"]] = relationship(back_populates="fir", cascade="all, delete-orphan")


class Person(Base, TimestampMixin):
    __tablename__ = "persons"
    __table_args__ = (CheckConstraint("age_years IS NULL OR age_years BETWEEN 0 AND 110", name="valid_age"),)
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    canonical_name: Mapped[str] = mapped_column(Text)
    normalized_name: Mapped[str] = mapped_column(Text, Computed("lower(regexp_replace(canonical_name, '\\s+', ' ', 'g'))", persisted=True))
    age_years: Mapped[int | None] = mapped_column(SmallInteger)
    gender: Mapped[GenderCode] = mapped_column(Enum(GenderCode), default=GenderCode.U)
    aadhaar_hash: Mapped[str | None] = mapped_column(String(64))
    source_table: Mapped[str | None] = mapped_column(String(64))
    source_record_id: Mapped[int | None] = mapped_column(BigInteger)


class CaseParty(Base):
    __tablename__ = "case_parties"
    __table_args__ = (UniqueConstraint("source_table", "source_record_id"),)
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    fir_id: Mapped[int] = mapped_column(ForeignKey("firs.id", ondelete="CASCADE"))
    person_id: Mapped[int] = mapped_column(ForeignKey("persons.id"))
    role: Mapped[PartyRole] = mapped_column(Enum(PartyRole))
    source_table: Mapped[str] = mapped_column(String(64))
    source_record_id: Mapped[int] = mapped_column(BigInteger)
    source_person_id: Mapped[str | None] = mapped_column(String(64))
    occupation_id: Mapped[int | None] = mapped_column(ForeignKey("occupations.id"))
    religion_id: Mapped[int | None] = mapped_column(ForeignKey("religions.id"))
    caste_id: Mapped[int | None] = mapped_column(ForeignKey("castes.id"))
    is_police_person: Mapped[bool | None] = mapped_column(Boolean)
    source_row_number: Mapped[int] = mapped_column(BigInteger)
    source_payload: Mapped[dict[str, Any]] = mapped_column(JSON)
    fir: Mapped[Fir] = relationship(back_populates="parties")


class FirSection(Base):
    __tablename__ = "fir_sections"
    fir_id: Mapped[int] = mapped_column(ForeignKey("firs.id", ondelete="CASCADE"), primary_key=True)
    section_id: Mapped[int] = mapped_column(ForeignKey("statutory_sections.id"), primary_key=True)
    act_order: Mapped[int | None] = mapped_column(SmallInteger)
    section_order: Mapped[int | None] = mapped_column(SmallInteger)
    source_row_number: Mapped[int | None] = mapped_column(BigInteger)


class ImportRun(Base):
    __tablename__ = "data_import_runs"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    dataset_name: Mapped[str] = mapped_column(Text)
    dataset_sha256: Mapped[str] = mapped_column(String(64))
    schema_version: Mapped[str] = mapped_column(String(32))
    status: Mapped[str] = mapped_column(String(16), default="PENDING")
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_file: Mapped[str | None] = mapped_column(String(255))
    last_row_number: Mapped[int] = mapped_column(BigInteger, default=0)
    rows_read: Mapped[int] = mapped_column(BigInteger, default=0)
    rows_imported: Mapped[int] = mapped_column(BigInteger, default=0)
    rows_rejected: Mapped[int] = mapped_column(BigInteger, default=0)
    statistics: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class ImportRejection(Base):
    __tablename__ = "data_import_rejections"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    import_run_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("data_import_runs.id", ondelete="CASCADE"))
    source_file: Mapped[str] = mapped_column(String(255))
    source_row_number: Mapped[int] = mapped_column(BigInteger)
    reason_code: Mapped[str] = mapped_column(String(64))
    reason_detail: Mapped[str] = mapped_column(Text)
    source_payload: Mapped[dict[str, Any]] = mapped_column(JSON)
