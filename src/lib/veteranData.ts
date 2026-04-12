/**
 * veteranData.ts — complete military reference data for the Kluje veteran program.
 *
 * Drives: signup checkbox, branch/rank/MOS dropdowns, profile section,
 * AI job-matching engine, veteran network, and homeowner preference filters.
 */

// ---------------------------------------------------------------------------
// Branches
// ---------------------------------------------------------------------------

export const MILITARY_BRANCHES = [
  { value: "army",                  label: "U.S. Army" },
  { value: "navy",                  label: "U.S. Navy" },
  { value: "marine_corps",          label: "U.S. Marine Corps" },
  { value: "air_force",             label: "U.S. Air Force" },
  { value: "coast_guard",           label: "U.S. Coast Guard" },
  { value: "space_force",           label: "U.S. Space Force" },
  { value: "army_national_guard",   label: "Army National Guard" },
  { value: "army_reserve",          label: "Army Reserve" },
  { value: "naval_reserve",         label: "Navy Reserve" },
  { value: "air_national_guard",    label: "Air National Guard" },
  { value: "marine_corps_reserve",  label: "Marine Corps Reserve" },
  { value: "coast_guard_reserve",   label: "Coast Guard Reserve" },
] as const;

export type MilitaryBranchValue = typeof MILITARY_BRANCHES[number]["value"];

// ---------------------------------------------------------------------------
// Ranks — grade + canonical title + branch-specific label
// ---------------------------------------------------------------------------

export interface RankOption {
  grade: string;       // E-1, W-3, O-6 …
  category: "enlisted" | "warrant" | "officer";
  armyTitle: string;
  navyTitle: string;
  marinesTitle: string;
  airForceTitle: string;
  coastGuardTitle: string;
  spaceForceTitle: string;
}

export const RANKS: RankOption[] = [
  // ── Enlisted ─────────────────────────────────────────────────────────────
  { grade: "E-1",  category: "enlisted", armyTitle: "Private",                    navyTitle: "Seaman Recruit",          marinesTitle: "Private",                  airForceTitle: "Airman Basic",               coastGuardTitle: "Seaman Recruit",         spaceForceTitle: "Specialist 1" },
  { grade: "E-2",  category: "enlisted", armyTitle: "Private 2nd Class",           navyTitle: "Seaman Apprentice",       marinesTitle: "Private 1st Class",         airForceTitle: "Airman",                     coastGuardTitle: "Seaman Apprentice",      spaceForceTitle: "Specialist 2" },
  { grade: "E-3",  category: "enlisted", armyTitle: "Private 1st Class",           navyTitle: "Seaman",                  marinesTitle: "Lance Corporal",            airForceTitle: "Airman 1st Class",           coastGuardTitle: "Seaman",                 spaceForceTitle: "Specialist 3" },
  { grade: "E-4",  category: "enlisted", armyTitle: "Specialist / Corporal",       navyTitle: "Petty Officer 3rd Class", marinesTitle: "Corporal",                  airForceTitle: "Senior Airman",              coastGuardTitle: "Petty Officer 3rd Class",spaceForceTitle: "Specialist 4" },
  { grade: "E-5",  category: "enlisted", armyTitle: "Sergeant",                    navyTitle: "Petty Officer 2nd Class", marinesTitle: "Sergeant",                  airForceTitle: "Staff Sergeant",             coastGuardTitle: "Petty Officer 2nd Class",spaceForceTitle: "Staff Sergeant" },
  { grade: "E-6",  category: "enlisted", armyTitle: "Staff Sergeant",              navyTitle: "Petty Officer 1st Class", marinesTitle: "Staff Sergeant",            airForceTitle: "Technical Sergeant",         coastGuardTitle: "Petty Officer 1st Class",spaceForceTitle: "Technical Sergeant" },
  { grade: "E-7",  category: "enlisted", armyTitle: "Sergeant First Class",        navyTitle: "Chief Petty Officer",     marinesTitle: "Gunnery Sergeant",          airForceTitle: "Master Sergeant",            coastGuardTitle: "Chief Petty Officer",    spaceForceTitle: "Master Sergeant" },
  { grade: "E-8",  category: "enlisted", armyTitle: "Master Sergeant / 1st Sgt",  navyTitle: "Senior Chief Petty Officer",marinesTitle:"Master Sgt / 1st Sgt",     airForceTitle: "Senior Master Sergeant",     coastGuardTitle: "Senior Chief Petty Officer",spaceForceTitle:"Senior Master Sergeant"},
  { grade: "E-9",  category: "enlisted", armyTitle: "Sergeant Major / CSM / SMA", navyTitle: "Master Chief / MCPON",    marinesTitle: "Master Gunnery Sgt / Sgt Major",airForceTitle:"Chief Master Sergeant",   coastGuardTitle: "Master Chief / MCPOCG",  spaceForceTitle: "Chief Master Sergeant" },
  // ── Warrant Officers ─────────────────────────────────────────────────────
  { grade: "W-1",  category: "warrant",  armyTitle: "Warrant Officer 1",           navyTitle: "Warrant Officer 1",       marinesTitle: "Warrant Officer 1",         airForceTitle: "—",                          coastGuardTitle: "Warrant Officer 1",      spaceForceTitle: "—" },
  { grade: "W-2",  category: "warrant",  armyTitle: "Chief Warrant Officer 2",     navyTitle: "Chief Warrant Officer 2", marinesTitle: "Chief Warrant Officer 2",   airForceTitle: "—",                          coastGuardTitle: "Chief Warrant Officer 2",spaceForceTitle: "—" },
  { grade: "W-3",  category: "warrant",  armyTitle: "Chief Warrant Officer 3",     navyTitle: "Chief Warrant Officer 3", marinesTitle: "Chief Warrant Officer 3",   airForceTitle: "—",                          coastGuardTitle: "Chief Warrant Officer 3",spaceForceTitle: "—" },
  { grade: "W-4",  category: "warrant",  armyTitle: "Chief Warrant Officer 4",     navyTitle: "Chief Warrant Officer 4", marinesTitle: "Chief Warrant Officer 4",   airForceTitle: "—",                          coastGuardTitle: "Chief Warrant Officer 4",spaceForceTitle: "—" },
  { grade: "W-5",  category: "warrant",  armyTitle: "Chief Warrant Officer 5",     navyTitle: "Chief Warrant Officer 5", marinesTitle: "Chief Warrant Officer 5",   airForceTitle: "—",                          coastGuardTitle: "Chief Warrant Officer 5",spaceForceTitle: "—" },
  // ── Commissioned Officers ────────────────────────────────────────────────
  { grade: "O-1",  category: "officer",  armyTitle: "2nd Lieutenant",              navyTitle: "Ensign",                  marinesTitle: "2nd Lieutenant",            airForceTitle: "2nd Lieutenant",             coastGuardTitle: "Ensign",                 spaceForceTitle: "2nd Lieutenant" },
  { grade: "O-2",  category: "officer",  armyTitle: "1st Lieutenant",              navyTitle: "Lieutenant JG",           marinesTitle: "1st Lieutenant",            airForceTitle: "1st Lieutenant",             coastGuardTitle: "Lieutenant JG",          spaceForceTitle: "1st Lieutenant" },
  { grade: "O-3",  category: "officer",  armyTitle: "Captain",                     navyTitle: "Lieutenant",              marinesTitle: "Captain",                   airForceTitle: "Captain",                    coastGuardTitle: "Lieutenant",             spaceForceTitle: "Captain" },
  { grade: "O-4",  category: "officer",  armyTitle: "Major",                       navyTitle: "Lieutenant Commander",    marinesTitle: "Major",                     airForceTitle: "Major",                      coastGuardTitle: "Lieutenant Commander",   spaceForceTitle: "Major" },
  { grade: "O-5",  category: "officer",  armyTitle: "Lieutenant Colonel",          navyTitle: "Commander",               marinesTitle: "Lieutenant Colonel",        airForceTitle: "Lieutenant Colonel",         coastGuardTitle: "Commander",              spaceForceTitle: "Lieutenant Colonel" },
  { grade: "O-6",  category: "officer",  armyTitle: "Colonel",                     navyTitle: "Captain",                 marinesTitle: "Colonel",                   airForceTitle: "Colonel",                    coastGuardTitle: "Captain",                spaceForceTitle: "Colonel" },
  { grade: "O-7",  category: "officer",  armyTitle: "Brigadier General",           navyTitle: "Rear Admiral (Lower)",    marinesTitle: "Brigadier General",         airForceTitle: "Brigadier General",          coastGuardTitle: "Rear Admiral (Lower)",   spaceForceTitle: "Brigadier General" },
  { grade: "O-8",  category: "officer",  armyTitle: "Major General",               navyTitle: "Rear Admiral (Upper)",    marinesTitle: "Major General",             airForceTitle: "Major General",              coastGuardTitle: "Rear Admiral (Upper)",   spaceForceTitle: "Major General" },
  { grade: "O-9",  category: "officer",  armyTitle: "Lieutenant General",          navyTitle: "Vice Admiral",            marinesTitle: "Lieutenant General",        airForceTitle: "Lieutenant General",         coastGuardTitle: "Vice Admiral",           spaceForceTitle: "Lieutenant General" },
  { grade: "O-10", category: "officer",  armyTitle: "General",                     navyTitle: "Admiral",                 marinesTitle: "General",                   airForceTitle: "General",                    coastGuardTitle: "Admiral",                spaceForceTitle: "General" },
];

/** Get the display title for a rank given a branch. */
export function getRankTitle(grade: string, branch: MilitaryBranchValue): string {
  const rank = RANKS.find((r) => r.grade === grade);
  if (!rank) return grade;
  switch (branch) {
    case "navy":
    case "naval_reserve":        return rank.navyTitle;
    case "marine_corps":
    case "marine_corps_reserve": return rank.marinesTitle;
    case "air_force":
    case "air_national_guard":   return rank.airForceTitle;
    case "coast_guard":
    case "coast_guard_reserve":  return rank.coastGuardTitle;
    case "space_force":          return rank.spaceForceTitle;
    default:                     return rank.armyTitle;
  }
}

// ---------------------------------------------------------------------------
// Military specialty / MOS categories
// (Groups hundreds of codes into meaningful trade-relevant categories)
// ---------------------------------------------------------------------------

export interface SpecialtyGroup {
  branch: MilitaryBranchValue | "all";
  label: string;
  specialties: { code: string; title: string }[];
  tradeAffinity?: string[];  // trade types this specialty maps to for job matching
}

export const SPECIALTY_GROUPS: SpecialtyGroup[] = [
  // ── ARMY ────────────────────────────────────────────────────────────────
  {
    branch: "army",
    label: "Infantry (11x)",
    specialties: [{ code: "11B", title: "Infantryman" }, { code: "11C", title: "Indirect Fire Infantryman" }],
    tradeAffinity: ["general_labor", "landscaping", "security"],
  },
  {
    branch: "army",
    label: "Combat Engineering (12x)",
    specialties: [
      { code: "12B", title: "Combat Engineer" },
      { code: "12C", title: "Bridge Crewmember" },
      { code: "12K", title: "Plumber" },
      { code: "12M", title: "Firefighter" },
      { code: "12N", title: "Horizontal Construction Engineer" },
      { code: "12P", title: "Prime Power Production Specialist" },
      { code: "12R", title: "Interior Electrician" },
      { code: "12T", title: "Technical Engineer" },
      { code: "12W", title: "Carpentry and Masonry Specialist" },
      { code: "12Y", title: "Geospatial Engineer" },
    ],
    tradeAffinity: ["roofing", "framing", "concrete", "electrical", "plumbing", "general_contractor"],
  },
  {
    branch: "army",
    label: "Signal / Communications (25x)",
    specialties: [
      { code: "25B", title: "IT Specialist" },
      { code: "25N", title: "Nodal Network Systems Operator" },
      { code: "25U", title: "Signal Support Systems Specialist" },
    ],
    tradeAffinity: ["electrical", "smart_home", "low_voltage"],
  },
  {
    branch: "army",
    label: "Ordnance / Mechanical (91x)",
    specialties: [
      { code: "91A", title: "M1 Armor Crewman Mechanic" },
      { code: "91B", title: "Wheeled Vehicle Mechanic" },
      { code: "91C", title: "Utilities Equipment Repairer" },
      { code: "91E", title: "Allied Trade Specialist" },
      { code: "91F", title: "Small Arms/Artillery Repairer" },
      { code: "91H", title: "Track Vehicle Repairer" },
      { code: "91L", title: "Construction Equipment Repairer" },
    ],
    tradeAffinity: ["hvac", "plumbing", "mechanical", "general_contractor"],
  },
  {
    branch: "army",
    label: "Quartermaster / Logistics (92x)",
    specialties: [
      { code: "92A", title: "Automated Logistical Specialist" },
      { code: "92F", title: "Petroleum Supply Specialist" },
      { code: "92G", title: "Food Service Specialist" },
      { code: "92W", title: "Water Treatment Specialist" },
    ],
    tradeAffinity: ["project_management", "logistics"],
  },
  {
    branch: "army",
    label: "Special Forces (18x)",
    specialties: [
      { code: "18A", title: "Special Forces Officer" },
      { code: "18B", title: "Special Forces Weapons Sergeant" },
      { code: "18C", title: "Special Forces Engineering Sergeant" },
      { code: "18D", title: "Special Forces Medical Sergeant" },
      { code: "18E", title: "Special Forces Communications Sergeant" },
    ],
    tradeAffinity: ["general_contractor", "project_management"],
  },
  // ── NAVY ─────────────────────────────────────────────────────────────────
  {
    branch: "navy",
    label: "Seabees — Construction (BU/CE/CM/SW/EO/UT)",
    specialties: [
      { code: "BU",  title: "Builder (Carpentry, Masonry, Concrete)" },
      { code: "CE",  title: "Construction Electrician" },
      { code: "CM",  title: "Construction Mechanic" },
      { code: "SW",  title: "Steelworker / Ironworker" },
      { code: "EO",  title: "Equipment Operator" },
      { code: "UT",  title: "Utilitiesman (Plumbing, HVAC, Gas)" },
    ],
    tradeAffinity: ["roofing", "framing", "electrical", "plumbing", "hvac", "concrete", "general_contractor"],
  },
  {
    branch: "navy",
    label: "Electrician's Mate (EM)",
    specialties: [{ code: "EM", title: "Electrician's Mate" }],
    tradeAffinity: ["electrical", "solar", "smart_home"],
  },
  {
    branch: "navy",
    label: "Hull Maintenance / Damage Control (HT/DC)",
    specialties: [
      { code: "HT", title: "Hull Maintenance Technician (Welding, Piping)" },
      { code: "DC", title: "Damage Controlman (Firefighting, Plumbing)" },
    ],
    tradeAffinity: ["plumbing", "welding", "roofing"],
  },
  {
    branch: "navy",
    label: "Machinist / Engineman (MM/EN)",
    specialties: [
      { code: "MM", title: "Machinist's Mate" },
      { code: "EN", title: "Engineman" },
    ],
    tradeAffinity: ["hvac", "mechanical", "plumbing"],
  },
  // ── MARINE CORPS ──────────────────────────────────────────────────────────
  {
    branch: "marine_corps",
    label: "Combat Engineering (1371)",
    specialties: [
      { code: "1341", title: "Engineer Equipment Mechanic" },
      { code: "1361", title: "Basic Engineer, Construction" },
      { code: "1371", title: "Combat Engineer" },
    ],
    tradeAffinity: ["roofing", "framing", "concrete", "general_contractor"],
  },
  {
    branch: "marine_corps",
    label: "Utilities (Electrician / HVAC / Plumbing)",
    specialties: [
      { code: "1141", title: "Electrician" },
      { code: "1142", title: "Electrical Equipment Repair Specialist" },
      { code: "1161", title: "Refrigeration and Air Conditioning Tech" },
      { code: "1171", title: "Water Support Tech (Plumbing)" },
    ],
    tradeAffinity: ["electrical", "hvac", "plumbing", "solar"],
  },
  // ── AIR FORCE ─────────────────────────────────────────────────────────────
  {
    branch: "air_force",
    label: "Civil Engineering (3E)",
    specialties: [
      { code: "3E0X1", title: "Electrical Systems" },
      { code: "3E1X1", title: "Heating, Ventilation & AC" },
      { code: "3E2X1", title: "Pavements & Construction Equipment" },
      { code: "3E3X1", title: "Structural (Carpentry, Roofing, Masonry)" },
      { code: "3E4X1", title: "Utilities Systems (Plumbing)" },
      { code: "3E4X3", title: "Pest Management" },
    ],
    tradeAffinity: ["electrical", "hvac", "roofing", "plumbing", "framing", "concrete"],
  },
  // ── ALL BRANCHES ──────────────────────────────────────────────────────────
  {
    branch: "all",
    label: "Medical / Corpsman",
    specialties: [
      { code: "68W",  title: "Combat Medic (Army)" },
      { code: "HM",   title: "Hospital Corpsman (Navy/Marines)" },
      { code: "4N0X1",title: "Aerospace Medical Technician (AF)" },
    ],
    tradeAffinity: ["remodeling"],
  },
  {
    branch: "all",
    label: "Military Police / Security",
    specialties: [
      { code: "31B",  title: "Military Police (Army)" },
      { code: "MA",   title: "Master-at-Arms (Navy)" },
      { code: "5811", title: "Military Police (Marines)" },
    ],
    tradeAffinity: ["security", "smart_home"],
  },
  {
    branch: "all",
    label: "Intelligence",
    specialties: [
      { code: "35F",  title: "Intelligence Analyst (Army)" },
      { code: "CT",   title: "Cryptologic Technician (Navy)" },
      { code: "1N0X1",title: "Operations Intelligence (AF)" },
    ],
    tradeAffinity: [],
  },
  {
    branch: "all",
    label: "Logistics / Transportation",
    specialties: [
      { code: "88M",  title: "Motor Transport Operator (Army)" },
      { code: "LS",   title: "Logistics Specialist (Navy)" },
      { code: "3531", title: "Motor Vehicle Operator (Marines)" },
    ],
    tradeAffinity: ["project_management", "logistics"],
  },
  {
    branch: "all",
    label: "Aviation Maintenance",
    specialties: [
      { code: "15T",  title: "UH-60 Helicopter Repairer (Army)" },
      { code: "AD",   title: "Aviation Machinist's Mate (Navy)" },
      { code: "6046", title: "Aircraft Maintenance (Marines)" },
    ],
    tradeAffinity: ["hvac", "mechanical"],
  },
  {
    branch: "all",
    label: "Special Operations",
    specialties: [
      { code: "18x",   title: "Special Forces (Army)" },
      { code: "SEALs", title: "Navy SEALs" },
      { code: "RECON", title: "Force Recon / MARSOC (Marines)" },
      { code: "PJ",    title: "Pararescue (AF)" },
      { code: "RANGER",title: "Army Ranger (75th Ranger Regiment)" },
    ],
    tradeAffinity: ["project_management", "general_contractor"],
  },
];

// ---------------------------------------------------------------------------
// Service eras
// ---------------------------------------------------------------------------

export const SERVICE_ERAS = [
  { value: "korea",         label: "Korean War (1950–1953)" },
  { value: "vietnam",       label: "Vietnam Era (1964–1975)" },
  { value: "cold_war",      label: "Cold War (1975–1990)" },
  { value: "gulf_war",      label: "Gulf War (1990–1991)" },
  { value: "peacetime",     label: "Peacetime (1991–2001)" },
  { value: "post_9_11",     label: "Post-9/11 / OEF / OIF (2001–2021)" },
  { value: "modern",        label: "Modern Era (2021–present)" },
] as const;

// ---------------------------------------------------------------------------
// Unit types
// ---------------------------------------------------------------------------

export const UNIT_TYPES = [
  "Infantry / Ground Combat",
  "Combat Engineering / Construction",
  "Seabee / Naval Construction",
  "Signal / Communications",
  "Ordnance / Mechanical",
  "Medical / Combat Medic",
  "Military Police / Security",
  "Intelligence / Cyber",
  "Logistics / Transportation",
  "Special Operations (SF, SEALs, Rangers, PJ, MARSOC)",
  "Artillery / Air Defense",
  "Aviation / Flight Operations",
  "Aviation Maintenance",
  "Civil Engineering (Air Force)",
  "Armor / Cavalry",
  "Finance / Administration",
  "Civil Affairs / PSYOP",
  "Judge Advocate / Legal",
  "Chaplain / Religious Support",
  "Submarine Warfare",
  "Naval Surface Warfare",
  "Quartermaster / Supply",
] as const;

// ---------------------------------------------------------------------------
// Security clearance levels
// ---------------------------------------------------------------------------

export const CLEARANCE_LEVELS = [
  { value: "none",       label: "None / Unclassified" },
  { value: "confidential",label: "Confidential" },
  { value: "secret",     label: "Secret" },
  { value: "top_secret", label: "Top Secret (TS)" },
  { value: "ts_sci",     label: "Top Secret / SCI" },
] as const;

// ---------------------------------------------------------------------------
// VA disability rating bands
// ---------------------------------------------------------------------------

export const VA_DISABILITY_RATINGS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;

// ---------------------------------------------------------------------------
// Years of service options
// ---------------------------------------------------------------------------

export const YEARS_OF_SERVICE = [
  { value: "0-2",   label: "Less than 2 years" },
  { value: "2-4",   label: "2–4 years" },
  { value: "4-8",   label: "4–8 years" },
  { value: "8-12",  label: "8–12 years" },
  { value: "12-16", label: "12–16 years" },
  { value: "16-20", label: "16–20 years" },
  { value: "20+",   label: "20+ years (Retired)" },
] as const;

// ---------------------------------------------------------------------------
// Trade affinity mapping for AI job matching
// (military specialty → Kluje trade key)
// ---------------------------------------------------------------------------

export function getTradeAffinities(
  branch: MilitaryBranchValue,
  specialtyCode: string
): string[] {
  const group = SPECIALTY_GROUPS.find(
    (g) =>
      (g.branch === branch || g.branch === "all") &&
      g.specialties.some((s) => s.code === specialtyCode)
  );
  return group?.tradeAffinity ?? [];
}

// ---------------------------------------------------------------------------
// Veteran subscription benefit
// ---------------------------------------------------------------------------

/** Months of free access granted to verified veterans on annual plans. */
export const VETERAN_FREE_MONTHS = 3;

export const VETERAN_BENEFITS = [
  `${VETERAN_FREE_MONTHS} months free on any annual subscription`,
  "Verified Veteran badge on your public profile",
  "Priority matching when homeowners request veteran contractors",
  "Access to the Veteran Contractor Network — connect with same-branch and same-unit peers",
  "Military skills translator — your MOS automatically maps to trade certifications",
  "Veteran-specific rebate and VA home loan program alerts",
  "SDVOSB / VOSB certification pathway guidance",
] as const;
