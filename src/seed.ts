import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SeedEntry {
  url: string;
  tags: {
    state?: string;
    aggregator_name?: string;
    url_type: string;
  };
  intervalMinutes?: number;
}

const SEED_URLS: SeedEntry[] = [
  // ==================================================================
  //  HHAeXchange — Top-level / corporate pages
  // ==================================================================
  {
    url: "https://www.hhaexchange.com/solutions/providers/electronic-visit-verification",
    tags: { aggregator_name: "HHAeXchange", url_type: "aggregator" },
  },
  {
    url: "https://www.hhaexchange.com/state-evv-status",
    tags: { aggregator_name: "HHAeXchange", url_type: "spec_doc" },
  },
  {
    url: "https://www.hhaexchange.com/solutions/state-medicaid-programs",
    tags: { aggregator_name: "HHAeXchange", url_type: "aggregator" },
  },
  {
    url: "https://www.hhaexchange.com/solutions/state-medicaid-programs/medicaid-business-intelligence",
    tags: { aggregator_name: "HHAeXchange", url_type: "aggregator" },
  },
  {
    url: "https://www.hhaexchange.com/solutions/self-direction",
    tags: { aggregator_name: "HHAeXchange", url_type: "aggregator" },
  },
  {
    url: "https://www.hhaexchange.com/solutions/mco",
    tags: { aggregator_name: "HHAeXchange", url_type: "aggregator" },
  },
  {
    url: "https://www.hhaexchange.com/solutions/providers",
    tags: { aggregator_name: "HHAeXchange", url_type: "aggregator" },
  },
  {
    url: "https://www.hhaexchange.com/platform",
    tags: { aggregator_name: "HHAeXchange", url_type: "aggregator" },
  },
  {
    url: "https://www.hhaexchange.com/partner-connect",
    tags: { aggregator_name: "HHAeXchange", url_type: "aggregator" },
  },
  {
    url: "https://www.hhaexchange.com/info-hub",
    tags: { aggregator_name: "HHAeXchange", url_type: "aggregator" },
  },
  {
    url: "https://www.hhaexchange.com/consumer-info-hub",
    tags: { aggregator_name: "HHAeXchange", url_type: "aggregator" },
  },

  // ==================================================================
  //  HHAeXchange — Provider state info hubs (one per state)
  // ==================================================================
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/alabama",
    tags: { state: "AL", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/arkansas",
    tags: { state: "AR", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/florida",
    tags: { state: "FL", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/hawaii",
    tags: { state: "HI", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/illinois",
    tags: { state: "IL", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/michigan",
    tags: { state: "MI", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/minnesota",
    tags: { state: "MN", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/mississippi",
    tags: { state: "MS", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/new-jersey",
    tags: { state: "NJ", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/new-york",
    tags: { state: "NY", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/north-carolina",
    tags: { state: "NC", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/oklahoma",
    tags: { state: "OK", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/pennsylvania",
    tags: { state: "PA", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/texas",
    tags: { state: "TX", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/virginia",
    tags: { state: "VA", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/provider-state/west-virginia",
    tags: { state: "WV", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },

  // ==================================================================
  //  HHAeXchange — Individual provider / payer info hubs (per state)
  // ==================================================================

  // Alabama
  {
    url: "https://www.hhaexchange.com/info-hub/alabama",
    tags: { state: "AL", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // Arkansas
  {
    url: "https://www.hhaexchange.com/info-hub/arkansas-state-medicaid-passe",
    tags: { state: "AR", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // Florida
  {
    url: "https://www.hhaexchange.com/info-hub/florida",
    tags: { state: "FL", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // Hawaii
  {
    url: "https://www.hhaexchange.com/info-hub/ohana-hp",
    tags: { state: "HI", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // Illinois
  {
    url: "https://www.hhaexchange.com/info-hub/illinois",
    tags: { state: "IL", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/illinois-doa-drs",
    tags: { state: "IL", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // Michigan
  {
    url: "https://www.hhaexchange.com/info-hub/michigan-information-center",
    tags: { state: "MI", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/meridian-michigan",
    tags: { state: "MI", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // Minnesota
  {
    url: "https://www.hhaexchange.com/info-hub/minnesota",
    tags: { state: "MN", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // Mississippi
  {
    url: "https://www.hhaexchange.com/info-hub/mississippi",
    tags: { state: "MS", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // New Jersey
  {
    url: "https://www.hhaexchange.com/info-hub/new-jersey-csoc",
    tags: { state: "NJ", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/new-jersey-dmahs-personal-care-services",
    tags: { state: "NJ", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/new-jersey-home-health",
    tags: { state: "NJ", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // New York
  {
    url: "https://www.hhaexchange.com/info-hub/aetna-better-health-of-ny",
    tags: { state: "NY", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/centerlight-healthcare-pace-of-new-york",
    tags: { state: "NY", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/elderplan-homefirst",
    tags: { state: "NY", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/fidelis-care",
    tags: { state: "NY", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/healthfirst",
    tags: { state: "NY", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/molina-healthcare-of-new-york-inc",
    tags: { state: "NY", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/nascentia-health",
    tags: { state: "NY", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/riverspring-health-plans",
    tags: { state: "NY", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/senior-whole-health",
    tags: { state: "NY", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/unitedhealthcare-community-plan-of-ny",
    tags: { state: "NY", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/visiting-nurse-service-of-new-york",
    tags: { state: "NY", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // North Carolina
  {
    url: "https://www.hhaexchange.com/info-hub/north-carolina-home-health",
    tags: { state: "NC", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/north-carolina-php",
    tags: { state: "NC", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/north-carolina-tailored-plan",
    tags: { state: "NC", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // Oklahoma
  {
    url: "https://www.hhaexchange.com/info-hub/oklahoma",
    tags: { state: "OK", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // Pennsylvania
  {
    url: "https://www.hhaexchange.com/info-hub/pennsylvania-community-healthchoices",
    tags: { state: "PA", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/pennsylvania-epsdt",
    tags: { state: "PA", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/info-hub/pennsylvania-home-health",
    tags: { state: "PA", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // Texas
  {
    url: "https://www.hhaexchange.com/info-hub/texas",
    tags: { state: "TX", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.hhaexchange.com/consumer-info-hub/texas-health-and-human-services",
    tags: { state: "TX", aggregator_name: "HHAeXchange", url_type: "portal" },
    intervalMinutes: 120,
  },

  // Virginia
  {
    url: "https://www.hhaexchange.com/info-hub/humana-virginia",
    tags: { state: "VA", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // West Virginia
  {
    url: "https://www.hhaexchange.com/info-hub/west-virginia",
    tags: { state: "WV", aggregator_name: "HHAeXchange", url_type: "export_guide" },
    intervalMinutes: 120,
  },

  // ==================================================================
  //  HHAeXchange — Press releases (state aggregator announcements)
  // ==================================================================
  {
    url: "https://www.hhaexchange.com/press-releases/hhaexchange-selected-by-the-state-of-michigan-as-evv-aggregator",
    tags: { state: "MI", aggregator_name: "HHAeXchange", url_type: "spec_doc" },
  },
  {
    url: "https://www.hhaexchange.com/press-releases/alabama-selects-hhaexchange-for-evv",
    tags: { state: "AL", aggregator_name: "HHAeXchange", url_type: "spec_doc" },
  },

  // ==================================================================
  //  HHAeXchange — Blog / resources / EVV content
  // ==================================================================
  {
    url: "https://www.hhaexchange.com/blog/topic/evv",
    tags: { aggregator_name: "HHAeXchange", url_type: "spec_doc" },
  },
  {
    url: "https://www.hhaexchange.com/resources",
    tags: { aggregator_name: "HHAeXchange", url_type: "spec_doc" },
  },

  // ==================================================================
  //  Other aggregators / vendors
  // ==================================================================
  {
    url: "https://www.sandata.com/evv",
    tags: { aggregator_name: "Sandata", url_type: "aggregator" },
  },
  {
    url: "https://www.sandata.com/electronic-visit-verification",
    tags: { aggregator_name: "Sandata", url_type: "aggregator" },
  },
  {
    url: "https://www.ntst.com/Solutions/Electronic-Visit-Verification",
    tags: { aggregator_name: "Netsmart/AuthentiCare", url_type: "aggregator" },
  },
  {
    url: "https://www.tellus.com/evv",
    tags: { aggregator_name: "Tellus", url_type: "aggregator" },
  },

  // ==================================================================
  //  State Medicaid EVV portals (non-HHAeXchange)
  // ==================================================================
  {
    url: "https://www.hhs.texas.gov/providers/long-term-care-providers/electronic-visit-verification",
    tags: { state: "TX", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://medicaid.ohio.gov/resources-for-providers/special-programs/evv",
    tags: { state: "OH", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://ahca.myflorida.com/medicaid/Policy_and_Quality/Policy/program_policy/electronic-visit-verification",
    tags: { state: "FL", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.health.ny.gov/health_care/medicaid/program/evv/",
    tags: { state: "NY", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.illinois.gov/hfs/MedicalProviders/ElectronicVisitVerification",
    tags: { state: "IL", url_type: "portal" },
    intervalMinutes: 120,
  },
  {
    url: "https://www.dhcs.ca.gov/provgovpart/Pages/EVV.aspx",
    tags: { state: "CA", url_type: "portal" },
    intervalMinutes: 120,
  },

  // ==================================================================
  //  Federal / CURES Act reference
  // ==================================================================
  {
    url: "https://www.medicaid.gov/medicaid/home-community-based-services/electronic-visit-verification/index.html",
    tags: { url_type: "portal", state: "Federal" },
    intervalMinutes: 240,
  },
];

async function seed(): Promise<void> {
  console.log("Seeding watchlist...");

  let created = 0;
  let skipped = 0;

  for (const entry of SEED_URLS) {
    const existing = await prisma.watchedUrl.findUnique({
      where: { url: entry.url },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.watchedUrl.create({
      data: {
        url: entry.url,
        source: "manual",
        status: "active",
        intervalMinutes: entry.intervalMinutes ?? 60,
        tags: JSON.stringify(entry.tags),
      },
    });
    created++;
  }

  console.log(`Seed complete: ${created} created, ${skipped} already existed`);
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
