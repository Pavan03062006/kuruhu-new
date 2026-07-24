from datetime import datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, JSON, LargeBinary, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class Occurrence(Base):
    __tablename__ = "occurrences"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    fir_id: Mapped[int] = mapped_column(ForeignKey("firs.id", ondelete="CASCADE"))
    occurred_from: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    occurred_to: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    latitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    longitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    source_row_number: Mapped[int | None] = mapped_column(BigInteger)


class PersonAlias(Base):
    __tablename__ = "person_aliases"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    person_id: Mapped[int] = mapped_column(ForeignKey("persons.id", ondelete="CASCADE"))
    alias: Mapped[str] = mapped_column(Text)
    normalized_alias: Mapped[str] = mapped_column(Text)


class PersonContact(Base):
    __tablename__ = "person_contacts"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    person_id: Mapped[int] = mapped_column(ForeignKey("persons.id", ondelete="CASCADE"))
    contact_type: Mapped[str] = mapped_column(String(24))
    value_encrypted: Mapped[bytes] = mapped_column(LargeBinary)
    value_hash: Mapped[str] = mapped_column(String(64), index=True)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)


class Organization(Base):
    __tablename__ = "organizations"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    organization_type: Mapped[str | None] = mapped_column(String(64))
    registration_number: Mapped[str | None] = mapped_column(String(128))


class Address(Base):
    __tablename__ = "addresses"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    person_id: Mapped[int | None] = mapped_column(ForeignKey("persons.id", ondelete="CASCADE"))
    organization_id: Mapped[int | None] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"))
    address_type: Mapped[str] = mapped_column(String(24), default="OTHER")
    line_1: Mapped[str | None] = mapped_column(Text)
    locality: Mapped[str | None] = mapped_column(Text)
    district_id: Mapped[int | None] = mapped_column(ForeignKey("districts.id"))
    state_id: Mapped[int | None] = mapped_column(ForeignKey("states.id"))
    postal_code: Mapped[str | None] = mapped_column(String(12))


class Vehicle(Base):
    __tablename__ = "vehicles"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    registration_number: Mapped[str] = mapped_column(String(32), unique=True)
    chassis_hash: Mapped[str | None] = mapped_column(String(64))
    engine_hash: Mapped[str | None] = mapped_column(String(64))
    make: Mapped[str | None] = mapped_column(Text)
    model: Mapped[str | None] = mapped_column(Text)


class Weapon(Base):
    __tablename__ = "weapons"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    weapon_type: Mapped[str] = mapped_column(String(128))
    description: Mapped[str | None] = mapped_column(Text)
    serial_number_hash: Mapped[str | None] = mapped_column(String(64))


class Evidence(Base):
    __tablename__ = "evidence"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    fir_id: Mapped[int] = mapped_column(ForeignKey("firs.id", ondelete="CASCADE"))
    evidence_type: Mapped[str] = mapped_column(String(64))
    description: Mapped[str | None] = mapped_column(Text)
    storage_reference: Mapped[str | None] = mapped_column(Text)
    collected_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    collected_by_officer_id: Mapped[int | None] = mapped_column(ForeignKey("officers.id"))
    chain_of_custody: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)


class Arrest(Base):
    __tablename__ = "arrests"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    source_arrest_id: Mapped[int | None] = mapped_column(BigInteger, unique=True)
    fir_id: Mapped[int] = mapped_column(ForeignKey("firs.id"))
    arrested_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    investigating_officer_id: Mapped[int | None] = mapped_column(ForeignKey("officers.id"))
    source_row_number: Mapped[int] = mapped_column(BigInteger)
    source_payload: Mapped[dict[str, Any]] = mapped_column(JSON)


class ChargeSheet(Base):
    __tablename__ = "charge_sheets"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    source_charge_sheet_id: Mapped[int | None] = mapped_column(BigInteger, unique=True)
    fir_id: Mapped[int] = mapped_column(ForeignKey("firs.id"))
    filed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    charge_sheet_type: Mapped[str] = mapped_column(String(8))
    filing_officer_id: Mapped[int | None] = mapped_column(ForeignKey("officers.id"))
    source_row_number: Mapped[int] = mapped_column(BigInteger)
    source_payload: Mapped[dict[str, Any]] = mapped_column(JSON)


class InvestigationNote(Base, TimestampMixin):
    __tablename__ = "investigation_notes"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    fir_id: Mapped[int] = mapped_column(ForeignKey("firs.id", ondelete="CASCADE"))
    author_officer_id: Mapped[int] = mapped_column(ForeignKey("officers.id"))
    note: Mapped[str] = mapped_column(Text)


class Attachment(Base):
    __tablename__ = "attachments"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    fir_id: Mapped[int] = mapped_column(ForeignKey("firs.id", ondelete="CASCADE"))
    object_key: Mapped[str] = mapped_column(Text, unique=True)
    original_name: Mapped[str] = mapped_column(Text)
    media_type: Mapped[str] = mapped_column(String(255))
    byte_size: Mapped[int] = mapped_column(BigInteger)
    sha256: Mapped[str] = mapped_column(String(64))
    uploaded_by_officer_id: Mapped[int | None] = mapped_column(ForeignKey("officers.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class SourceRecord(Base):
    __tablename__ = "source_records"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    import_run_id: Mapped[object] = mapped_column(ForeignKey("data_import_runs.id"))
    source_file: Mapped[str] = mapped_column(String(255))
    source_table: Mapped[str] = mapped_column(String(64))
    source_record_id: Mapped[str | None] = mapped_column(String(128))
    source_row_number: Mapped[int] = mapped_column(BigInteger)
    target_table: Mapped[str | None] = mapped_column(String(64))
    target_record_id: Mapped[int | None] = mapped_column(BigInteger)
    payload_sha256: Mapped[str] = mapped_column(String(64))


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    actor_officer_id: Mapped[int | None] = mapped_column(ForeignKey("officers.id"))
    action: Mapped[str] = mapped_column(String(64))
    entity_type: Mapped[str] = mapped_column(String(64))
    entity_id: Mapped[str] = mapped_column(String(128))
    before_data: Mapped[dict[str, Any] | None] = mapped_column(JSON)
    after_data: Mapped[dict[str, Any] | None] = mapped_column(JSON)
