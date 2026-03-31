import providerServiceTaxonomyJson from '@/data/providerServiceTaxonomy.json';

export interface ProviderServiceTaxonomyGroup {
  category: string;
  subcategories: string[];
}

export interface ServiceCategoryRow {
  id: string;
  name: string;
  parent_id: string | null;
}

export interface TaxonomySelection {
  category: string;
  service: string;
}

export const providerServiceTaxonomy = providerServiceTaxonomyJson as ProviderServiceTaxonomyGroup[];

export const providerServiceOptions = providerServiceTaxonomy.flatMap((group) =>
  group.subcategories.map((service) => ({ category: group.category, service }))
);

const normalize = (value: string) => value.trim().toLowerCase();

export const mapServicesToCategoryIds = (
  selectedServices: string[],
  categories: ServiceCategoryRow[],
): { categoryIds: string[]; missingServices: string[] } => {
  const categoryByName = new Map(categories.map((category) => [normalize(category.name), category.id]));

  const categoryIds: string[] = [];
  const missingServices: string[] = [];

  selectedServices.forEach((service) => {
    const categoryId = categoryByName.get(normalize(service));

    if (categoryId) {
      categoryIds.push(categoryId);
      return;
    }

    missingServices.push(service);
  });

  return {
    categoryIds,
    missingServices,
  };
};
