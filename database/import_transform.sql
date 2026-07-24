-- Runs with the import staging schema first on search_path.
INSERT INTO states (source_state_id,name,nationality_id,is_active)
SELECT "StateID"::bigint,"StateName",NULLIF("NationalityID",'')::bigint,"Active"='1' FROM state ON CONFLICT (source_state_id) DO UPDATE SET name=excluded.name,is_active=excluded.is_active;

INSERT INTO districts (source_district_id,state_id,name,is_active)
SELECT d."DistrictID"::bigint,s.id,d."DistrictName",d."Active"='1' FROM district d JOIN states s ON s.source_state_id=d."StateID"::bigint ON CONFLICT (source_district_id) DO UPDATE SET name=excluded.name,is_active=excluded.is_active;

INSERT INTO unit_types (source_unit_type_id,name,jurisdiction_level,hierarchy_level,is_active)
SELECT "UnitTypeID"::bigint,"UnitTypeName",NULLIF("CityDistState",''),NULLIF("Hierarchy",'')::smallint,"Active"='1' FROM unittype ON CONFLICT (source_unit_type_id) DO UPDATE SET name=excluded.name,is_active=excluded.is_active;

INSERT INTO police_units (source_unit_id,name,unit_type_id,state_id,district_id,is_active)
SELECT u."UnitID"::bigint,u."UnitName",ut.id,s.id,d.id,u."Active"='1' FROM unit u JOIN unit_types ut ON ut.source_unit_type_id=u."TypeID"::bigint LEFT JOIN states s ON s.source_state_id=NULLIF(u."StateID",'')::bigint LEFT JOIN districts d ON d.source_district_id=NULLIF(u."DistrictID",'')::bigint ON CONFLICT (source_unit_id) DO UPDATE SET name=excluded.name,is_active=excluded.is_active;
UPDATE police_units child SET parent_unit_id=parent.id FROM unit raw JOIN police_units parent ON parent.source_unit_id=NULLIF(raw."ParentUnit",'')::bigint WHERE child.source_unit_id=raw."UnitID"::bigint AND NULLIF(raw."ParentUnit",'') IS NOT NULL;

INSERT INTO case_categories SELECT "CaseCategoryID"::smallint,"LookupValue" FROM casecategory ON CONFLICT (id) DO UPDATE SET name=excluded.name;
INSERT INTO case_statuses SELECT "CaseStatusID"::smallint,"CaseStatusName" FROM casestatusmaster ON CONFLICT (id) DO UPDATE SET name=excluded.name;
INSERT INTO gravity_offences SELECT "GravityOffenceID"::smallint,"LookupValue" FROM gravityoffence ON CONFLICT (id) DO UPDATE SET name=excluded.name;
INSERT INTO crime_heads SELECT "CrimeHeadID"::bigint,"CrimeGroupName","Active"='1' FROM crimehead ON CONFLICT (id) DO UPDATE SET name=excluded.name,is_active=excluded.is_active;
INSERT INTO crime_sub_heads SELECT "CrimeSubHeadID"::bigint,"CrimeHeadID"::bigint,"CrimeHeadName",NULLIF("SeqID",'')::integer FROM crimesubhead ON CONFLICT (id) DO UPDATE SET name=excluded.name;
INSERT INTO occupations SELECT "OccupationID"::bigint,"OccupationName" FROM occupationmaster ON CONFLICT (id) DO UPDATE SET name=excluded.name;
INSERT INTO religions SELECT "ReligionID"::bigint,"ReligionName" FROM religionmaster ON CONFLICT (id) DO UPDATE SET name=excluded.name;
INSERT INTO castes SELECT caste_master_id::bigint,caste_master_name FROM castemaster ON CONFLICT (id) DO UPDATE SET name=excluded.name;
INSERT INTO ranks SELECT "RankID"::bigint,"RankName",NULLIF("Hierarchy",'')::smallint,"Active"='1' FROM rank ON CONFLICT (id) DO UPDATE SET name=excluded.name;
INSERT INTO designations SELECT "DesignationID"::bigint,"DesignationName",NULLIF("SortOrder",'')::smallint,"Active"='1' FROM designation ON CONFLICT (id) DO UPDATE SET name=excluded.name;
INSERT INTO acts SELECT "ActCode","ActDescription","ShortName","Active"='1' FROM act ON CONFLICT (code) DO UPDATE SET description=excluded.description,is_active=excluded.is_active;
INSERT INTO statutory_sections (act_code,section_code,description,is_active) SELECT "ActCode","SectionCode","SectionDescription","Active"='1' FROM section ON CONFLICT (act_code,section_code) DO UPDATE SET description=excluded.description,is_active=excluded.is_active;

INSERT INTO courts (source_court_id,name,district_id,state_id,is_active)
SELECT c."CourtID"::bigint,c."CourtName",d.id,s.id,c."Active"='1' FROM court c LEFT JOIN districts d ON d.source_district_id=NULLIF(c."DistrictID",'')::bigint LEFT JOIN states s ON s.source_state_id=NULLIF(c."StateID",'')::bigint ON CONFLICT (source_court_id) DO UPDATE SET name=excluded.name,is_active=excluded.is_active;

INSERT INTO officers (source_employee_id,kgid,district_id,unit_id,rank_id,designation_id,first_name,date_of_birth,gender,blood_group_id,is_physically_challenged,appointment_date)
SELECT e."EmployeeID"::bigint,NULLIF(e."KGID",''),d.id,u.id,NULLIF(e."RankID",'')::bigint,NULLIF(e."DesignationID",'')::bigint,e."FirstName",NULLIF(e."EmployeeDOB",'')::date,COALESCE(NULLIF(e."GenderID",''),'U')::gender_code,NULLIF(e."BloodGroupID",'')::bigint,e."PhysicallyChallenged"='1',NULLIF(e."AppointmentDate",'')::date FROM employee e LEFT JOIN districts d ON d.source_district_id=NULLIF(e."DistrictID",'')::bigint LEFT JOIN police_units u ON u.source_unit_id=NULLIF(e."UnitID",'')::bigint ON CONFLICT (source_employee_id) DO UPDATE SET first_name=excluded.first_name,unit_id=excluded.unit_id;

INSERT INTO firs (source_case_master_id,crime_number,case_number,registered_at,investigating_officer_id,police_station_id,category_id,gravity_id,crime_head_id,crime_sub_head_id,status_id,court_id,incident_from,incident_to,information_received_at,latitude,longitude,brief_facts,source_row_number,source_payload)
SELECT c."CaseMasterID"::bigint,c."CrimeNo",NULLIF(c."CaseNo",''),c."CrimeRegisteredDate"::timestamptz,o.id,u.id,NULLIF(c."CaseCategoryID",'')::smallint,NULLIF(c."GravityOffenceID",'')::smallint,NULLIF(c."CrimeMajorHeadID",'')::bigint,NULLIF(c."CrimeMinorHeadID",'')::bigint,NULLIF(c."CaseStatusID",'')::smallint,ct.id,NULLIF(c."IncidentFromDate",'')::timestamptz,NULLIF(c."IncidentToDate",'')::timestamptz,NULLIF(c."InfoReceivedPSDate",'')::timestamptz,NULLIF(c.latitude,'')::numeric,NULLIF(c.longitude,'')::numeric,NULLIF(c."BriefFacts",''),c._source_row,to_jsonb(c)-'_source_row' FROM casemaster c JOIN police_units u ON u.source_unit_id=c."PoliceStationID"::bigint LEFT JOIN officers o ON o.source_employee_id=NULLIF(c."PolicePersonID",'')::bigint LEFT JOIN courts ct ON ct.source_court_id=NULLIF(c."CourtID",'')::bigint ON CONFLICT (source_case_master_id) DO UPDATE SET status_id=excluded.status_id,updated_at=now(),source_payload=excluded.source_payload;

INSERT INTO occurrences (fir_id,occurred_from,occurred_to,latitude,longitude,source_row_number)
SELECT f.id,NULLIF(x."OccurrenceFromDate",'')::timestamptz,NULLIF(x."OccurrenceToDate",'')::timestamptz,NULLIF(x.latitude,'')::numeric,NULLIF(x.longitude,'')::numeric,x._source_row FROM inv_occurrencetime x JOIN firs f ON f.source_case_master_id=x."CaseMasterID"::bigint WHERE NOT EXISTS (SELECT 1 FROM occurrences o WHERE o.fir_id=f.id);

INSERT INTO persons (canonical_name,age_years,gender,source_table,source_record_id)
SELECT "AccusedName",NULLIF("AgeYear",'')::smallint,COALESCE(NULLIF("GenderID",''),'U')::gender_code,'Accused',"AccusedMasterID"::bigint FROM accused ON CONFLICT (source_table,source_record_id) DO UPDATE SET canonical_name=excluded.canonical_name,age_years=excluded.age_years,gender=excluded.gender;
INSERT INTO case_parties (fir_id,person_id,role,source_table,source_record_id,source_person_id,source_row_number,source_payload)
SELECT f.id,p.id,'ACCUSED', 'Accused',a."AccusedMasterID"::bigint,NULLIF(a."PersonID",''),a._source_row,to_jsonb(a)-'_source_row' FROM accused a JOIN firs f ON f.source_case_master_id=a."CaseMasterID"::bigint JOIN persons p ON p.source_table='Accused' AND p.source_record_id=a."AccusedMasterID"::bigint ON CONFLICT (source_table,source_record_id) DO NOTHING;

INSERT INTO persons (canonical_name,age_years,gender,source_table,source_record_id)
SELECT "VictimName",NULLIF("AgeYear",'')::smallint,COALESCE(NULLIF("GenderID",''),'U')::gender_code,'Victim',"VictimMasterID"::bigint FROM victim ON CONFLICT (source_table,source_record_id) DO UPDATE SET canonical_name=excluded.canonical_name,age_years=excluded.age_years,gender=excluded.gender;
INSERT INTO case_parties (fir_id,person_id,role,source_table,source_record_id,is_police_person,source_row_number,source_payload)
SELECT f.id,p.id,'VICTIM','Victim',v."VictimMasterID"::bigint,v."VictimPolice"='1',v._source_row,to_jsonb(v)-'_source_row' FROM victim v JOIN firs f ON f.source_case_master_id=v."CaseMasterID"::bigint JOIN persons p ON p.source_table='Victim' AND p.source_record_id=v."VictimMasterID"::bigint ON CONFLICT (source_table,source_record_id) DO NOTHING;

INSERT INTO persons (canonical_name,age_years,gender,source_table,source_record_id)
SELECT "ComplainantName",NULLIF("AgeYear",'')::smallint,COALESCE(NULLIF("GenderID",''),'U')::gender_code,'ComplainantDetails',"ComplainantID"::bigint FROM complainantdetails ON CONFLICT (source_table,source_record_id) DO UPDATE SET canonical_name=excluded.canonical_name,age_years=excluded.age_years,gender=excluded.gender;
INSERT INTO case_parties (fir_id,person_id,role,source_table,source_record_id,occupation_id,religion_id,caste_id,source_row_number,source_payload)
SELECT f.id,p.id,'COMPLAINANT','ComplainantDetails',c."ComplainantID"::bigint,NULLIF(c."OccupationID",'')::bigint,NULLIF(c."ReligionID",'')::bigint,NULLIF(c."CasteID",'')::bigint,c._source_row,to_jsonb(c)-'_source_row' FROM complainantdetails c JOIN firs f ON f.source_case_master_id=c."CaseMasterID"::bigint JOIN persons p ON p.source_table='ComplainantDetails' AND p.source_record_id=c."ComplainantID"::bigint ON CONFLICT (source_table,source_record_id) DO NOTHING;

INSERT INTO fir_sections (fir_id,section_id,act_order,section_order,source_row_number)
SELECT f.id,s.id,NULLIF(a."ActOrderID",'')::smallint,NULLIF(a."SectionOrderID",'')::smallint,a._source_row FROM actsectionassociation a JOIN firs f ON f.source_case_master_id=a."CaseMasterID"::bigint JOIN statutory_sections s ON s.act_code=a."ActID" AND s.section_code=a."SectionID" ON CONFLICT DO NOTHING;

INSERT INTO arrests (source_arrest_id,fir_id,arrest_type_id,arrested_at,state_id,district_id,police_station_id,investigating_officer_id,court_id,is_accused,is_complainant_accused,source_row_number,source_payload)
SELECT a."ArrestSurrenderID"::bigint,f.id,NULLIF(a."ArrestSurrenderTypeID",'')::bigint,NULLIF(a."ArrestSurrenderDate",'')::timestamptz,s.id,d.id,u.id,o.id,c.id,a."IsAccused"='1',a."IsComplainantAccused"='1',a._source_row,to_jsonb(a)-'_source_row' FROM arrestsurrender a JOIN firs f ON f.source_case_master_id=a."CaseMasterID"::bigint LEFT JOIN states s ON s.source_state_id=NULLIF(a."ArrestSurrenderStateId",'')::bigint LEFT JOIN districts d ON d.source_district_id=NULLIF(a."ArrestSurrenderDistrictId",'')::bigint LEFT JOIN police_units u ON u.source_unit_id=NULLIF(a."PoliceStationID",'')::bigint LEFT JOIN officers o ON o.source_employee_id=NULLIF(a."IOID",'')::bigint LEFT JOIN courts c ON c.source_court_id=NULLIF(a."CourtID",'')::bigint ON CONFLICT (source_arrest_id) DO UPDATE SET arrested_at=excluded.arrested_at,source_payload=excluded.source_payload;
INSERT INTO arrest_parties (arrest_id,case_party_id)
SELECT ar.id,cp.id FROM inv_arrestsurrenderaccused j JOIN arrests ar ON ar.source_arrest_id=j."ArrestSurrenderID"::bigint JOIN case_parties cp ON cp.source_table='Accused' AND cp.source_record_id=j."AccusedMasterID"::bigint ON CONFLICT DO NOTHING;

INSERT INTO data_import_rejections (import_run_id,source_file,source_row_number,reason_code,reason_detail,source_payload)
SELECT %(run_id)s,'inv_arrestsurrenderaccused.csv',j._source_row,'ACCUSED_NOT_FOUND','Arrest junction references an accused absent from the proxy Accused table',to_jsonb(j)-'_source_row' FROM inv_arrestsurrenderaccused j LEFT JOIN case_parties cp ON cp.source_table='Accused' AND cp.source_record_id=NULLIF(j."AccusedMasterID",'')::bigint WHERE cp.id IS NULL ON CONFLICT DO NOTHING;

INSERT INTO data_import_rejections (import_run_id,source_file,source_row_number,reason_code,reason_detail,source_payload)
SELECT %(run_id)s,'Victim_orphaned_records.csv',v._source_row,'FIR_NOT_FOUND','Quarantined proxy victim references a CaseMasterID absent from CaseMaster.csv',to_jsonb(v)-'_source_row' FROM victim_orphaned_records v ON CONFLICT DO NOTHING;

INSERT INTO charge_sheets (source_charge_sheet_id,fir_id,filed_at,charge_sheet_type,filing_officer_id,source_row_number,source_payload)
SELECT c."CSID"::bigint,f.id,c."csdate"::timestamptz,c."cstype",o.id,c._source_row,to_jsonb(c)-'_source_row' FROM chargesheetdetails c JOIN firs f ON f.source_case_master_id=c."CaseMasterID"::bigint LEFT JOIN officers o ON o.source_employee_id=NULLIF(c."PolicePersonID",'')::bigint ON CONFLICT (source_charge_sheet_id) DO UPDATE SET filed_at=excluded.filed_at,charge_sheet_type=excluded.charge_sheet_type,source_payload=excluded.source_payload;

INSERT INTO source_records (import_run_id,source_file,source_table,source_record_id,source_row_number,target_table,target_record_id,payload_sha256)
SELECT %(run_id)s,'CaseMaster.csv','CaseMaster',f.source_case_master_id::text,f.source_row_number,'firs',f.id,encode(digest(f.source_payload::text,'sha256'),'hex') FROM firs f ON CONFLICT DO NOTHING;

UPDATE data_import_runs r SET rows_rejected=(SELECT count(*) FROM data_import_rejections x WHERE x.import_run_id=r.id) WHERE r.id=%(run_id)s;
