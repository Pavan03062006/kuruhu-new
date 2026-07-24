from dataclasses import dataclass


@dataclass(frozen=True)
class ForeignKeySpec:
    column: str
    target_file: str
    target_column: str
    nullable: bool = False


@dataclass(frozen=True)
class TableSpec:
    primary_key: tuple[str, ...]
    foreign_keys: tuple[ForeignKeySpec, ...] = ()


TABLE_SPECS: dict[str, TableSpec] = {
    "State.csv": TableSpec(("StateID",)),
    "District.csv": TableSpec(("DistrictID",), (ForeignKeySpec("StateID", "State.csv", "StateID"),)),
    "UnitType.csv": TableSpec(("UnitTypeID",)),
    "Unit.csv": TableSpec(("UnitID",), (ForeignKeySpec("TypeID", "UnitType.csv", "UnitTypeID"), ForeignKeySpec("StateID", "State.csv", "StateID"), ForeignKeySpec("DistrictID", "District.csv", "DistrictID"), ForeignKeySpec("ParentUnit", "Unit.csv", "UnitID", True))),
    "Court.csv": TableSpec(("CourtID",), (ForeignKeySpec("DistrictID", "District.csv", "DistrictID"), ForeignKeySpec("StateID", "State.csv", "StateID"))),
    "Rank.csv": TableSpec(("RankID",)),
    "Designation.csv": TableSpec(("DesignationID",)),
    "OccupationMaster.csv": TableSpec(("OccupationID",)),
    "ReligionMaster.csv": TableSpec(("ReligionID",)),
    "CasteMaster.csv": TableSpec(("caste_master_id",)),
    "CaseCategory.csv": TableSpec(("CaseCategoryID",)),
    "CaseStatusMaster.csv": TableSpec(("CaseStatusID",)),
    "GravityOffence.csv": TableSpec(("GravityOffenceID",)),
    "CrimeHead.csv": TableSpec(("CrimeHeadID",)),
    "CrimeSubHead.csv": TableSpec(("CrimeSubHeadID",), (ForeignKeySpec("CrimeHeadID", "CrimeHead.csv", "CrimeHeadID"),)),
    "Act.csv": TableSpec(("ActCode",)),
    "Section.csv": TableSpec(("ActCode", "SectionCode"), (ForeignKeySpec("ActCode", "Act.csv", "ActCode"),)),
    "Employee.csv": TableSpec(("EmployeeID",), (ForeignKeySpec("DistrictID", "District.csv", "DistrictID"), ForeignKeySpec("UnitID", "Unit.csv", "UnitID"), ForeignKeySpec("RankID", "Rank.csv", "RankID"), ForeignKeySpec("DesignationID", "Designation.csv", "DesignationID", True))),
    "CaseMaster.csv": TableSpec(("CaseMasterID",), (ForeignKeySpec("PolicePersonID", "Employee.csv", "EmployeeID", True), ForeignKeySpec("PoliceStationID", "Unit.csv", "UnitID"), ForeignKeySpec("CaseCategoryID", "CaseCategory.csv", "CaseCategoryID"), ForeignKeySpec("GravityOffenceID", "GravityOffence.csv", "GravityOffenceID", True), ForeignKeySpec("CrimeMajorHeadID", "CrimeHead.csv", "CrimeHeadID"), ForeignKeySpec("CrimeMinorHeadID", "CrimeSubHead.csv", "CrimeSubHeadID"), ForeignKeySpec("CaseStatusID", "CaseStatusMaster.csv", "CaseStatusID"), ForeignKeySpec("CourtID", "Court.csv", "CourtID", True))),
    "Inv_OccuranceTime.csv": TableSpec(("CaseMasterID",), (ForeignKeySpec("CaseMasterID", "CaseMaster.csv", "CaseMasterID"),)),
    "Accused.csv": TableSpec(("AccusedMasterID",), (ForeignKeySpec("CaseMasterID", "CaseMaster.csv", "CaseMasterID"),)),
    "Victim.csv": TableSpec(("VictimMasterID",), (ForeignKeySpec("CaseMasterID", "CaseMaster.csv", "CaseMasterID"),)),
    "ComplainantDetails.csv": TableSpec(("ComplainantID",), (ForeignKeySpec("CaseMasterID", "CaseMaster.csv", "CaseMasterID"), ForeignKeySpec("OccupationID", "OccupationMaster.csv", "OccupationID", True), ForeignKeySpec("ReligionID", "ReligionMaster.csv", "ReligionID", True), ForeignKeySpec("CasteID", "CasteMaster.csv", "caste_master_id", True))),
    "ActSectionAssociation.csv": TableSpec(("CaseMasterID", "ActID", "SectionID", "ActOrderID", "SectionOrderID"), (ForeignKeySpec("CaseMasterID", "CaseMaster.csv", "CaseMasterID"), ForeignKeySpec("ActID", "Act.csv", "ActCode"))),
    "ArrestSurrender.csv": TableSpec(("ArrestSurrenderID",), (ForeignKeySpec("CaseMasterID", "CaseMaster.csv", "CaseMasterID"), ForeignKeySpec("PoliceStationID", "Unit.csv", "UnitID", True), ForeignKeySpec("IOID", "Employee.csv", "EmployeeID", True), ForeignKeySpec("CourtID", "Court.csv", "CourtID", True), ForeignKeySpec("AccusedMasterID", "Accused.csv", "AccusedMasterID", True))),
    "inv_arrestsurrenderaccused.csv": TableSpec(("JunctionID",), (ForeignKeySpec("ArrestSurrenderID", "ArrestSurrender.csv", "ArrestSurrenderID"), ForeignKeySpec("AccusedMasterID", "Accused.csv", "AccusedMasterID"))),
    "ChargesheetDetails.csv": TableSpec(("CSID",), (ForeignKeySpec("CaseMasterID", "CaseMaster.csv", "CaseMasterID"), ForeignKeySpec("PolicePersonID", "Employee.csv", "EmployeeID", True))),
}

QUARANTINE_FILES = ("Victim_orphaned_records.csv",)
IMPORT_ORDER = tuple(TABLE_SPECS) + QUARANTINE_FILES

# Known proxy gaps are warnings, not authority to weaken the official target FKs.
SOFT_FOREIGN_KEYS = {
    ("CaseMaster.csv", "PolicePersonID"),
    ("ArrestSurrender.csv", "IOID"),
    ("inv_arrestsurrenderaccused.csv", "AccusedMasterID"),
}
