import type * as prismic from "@prismicio/client";

type Simplify<T> = { [KeyType in keyof T]: T[KeyType] };


type PickContentRelationshipFieldData<
	TRelationship extends prismic.CustomTypeModelFetchCustomTypeLevel1 | prismic.CustomTypeModelFetchCustomTypeLevel2 | prismic.CustomTypeModelFetchGroupLevel1 | prismic.CustomTypeModelFetchGroupLevel2,
	TData extends Record<string, prismic.AnyRegularField | prismic.GroupField | prismic.NestedGroupField | prismic.SliceZone>,
	TLang extends string
> = |
	// Content relationship fields
	{
		[TSubRelationship in Extract<
			TRelationship["fields"][number], prismic.CustomTypeModelFetchContentRelationshipLevel1
		> as TSubRelationship["id"]]:
			ContentRelationshipFieldWithData<TSubRelationship["customtypes"], TLang>;
	} &
	// Group
	{
		[TGroup in Extract<
			TRelationship["fields"][number], prismic.CustomTypeModelFetchGroupLevel1 | prismic.CustomTypeModelFetchGroupLevel2
		> as TGroup["id"]]:
			TData[TGroup["id"]] extends prismic.GroupField<infer TGroupData>
				? prismic.GroupField<PickContentRelationshipFieldData<TGroup, TGroupData, TLang>>
				: never
	} &
	// Other fields
	{
		[TFieldKey in Extract<TRelationship["fields"][number], string>]:
			TFieldKey extends keyof TData ? TData[TFieldKey] : never;
	};

type ContentRelationshipFieldWithData<
	TCustomType extends readonly (prismic.CustomTypeModelFetchCustomTypeLevel1 | string)[] | readonly (prismic.CustomTypeModelFetchCustomTypeLevel2 | string)[],
	TLang extends string = string
> = {
	[ID in Exclude<TCustomType[number], string>["id"]]:
		prismic.ContentRelationshipField<
			ID,
			TLang,
			PickContentRelationshipFieldData<
				Extract<TCustomType[number], { id: ID }>,
				Extract<prismic.Content.AllDocumentTypes, { type: ID }>["data"],
				TLang
			>
		>
}[Exclude<TCustomType[number], string>["id"]];

type AboutDocumentDataSlicesSlice = AboutSlice

/**
 * Content for About documents
 */
interface AboutDocumentData {
	/**
	 * Slice Zone field in *About*
	 *
	 * - **Field Type**: Slice Zone
	 * - **Placeholder**: *None*
	 * - **API ID Path**: about.slices[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/slices
	 */
	slices: prismic.SliceZone<AboutDocumentDataSlicesSlice>;/**
	 * Meta Title field in *About*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A title of the page used for social media and search engines
	 * - **API ID Path**: about.meta_title
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_title: prismic.KeyTextField;
	
	/**
	 * Meta Description field in *About*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A brief summary of the page
	 * - **API ID Path**: about.meta_description
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_description: prismic.KeyTextField;
	
	/**
	 * Meta Image field in *About*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: about.meta_image
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	meta_image: prismic.ImageField<never>;
}

/**
 * About document from Prismic
 *
 * - **API ID**: `about`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type AboutDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<AboutDocumentData>, "about", Lang>;

type HomepageDocumentDataSlicesSlice = AboutSlice | HeroSlice

/**
 * Content for Homepage documents
 */
interface HomepageDocumentData {
	/**
	 * Slice Zone field in *Homepage*
	 *
	 * - **Field Type**: Slice Zone
	 * - **Placeholder**: *None*
	 * - **API ID Path**: homepage.slices[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/slices
	 */
	slices: prismic.SliceZone<HomepageDocumentDataSlicesSlice>;/**
	 * Meta Title field in *Homepage*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A title of the page used for social media and search engines
	 * - **API ID Path**: homepage.meta_title
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_title: prismic.KeyTextField;
	
	/**
	 * Meta Description field in *Homepage*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A brief summary of the page
	 * - **API ID Path**: homepage.meta_description
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_description: prismic.KeyTextField;
	
	/**
	 * Meta Image field in *Homepage*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: homepage.meta_image
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	meta_image: prismic.ImageField<never>;
}

/**
 * Homepage document from Prismic
 *
 * - **API ID**: `homepage`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type HomepageDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<HomepageDocumentData>, "homepage", Lang>;

/**
 * Item in *Project → Gallery*
 */
export interface ProjectDocumentDataGalleryItem {
	/**
	 * Screenshot field in *Project → Gallery*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: Detail view screenshot, roughly 12:7
	 * - **API ID Path**: project.gallery[].image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image: prismic.ImageField<never>;
}

/**
 * Content for Project documents
 */
interface ProjectDocumentData {
	/**
	 * Title field in *Project*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Funnered Tutors
	 * - **API ID Path**: project.title
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	title: prismic.KeyTextField;
	
	/**
	 * Order field in *Project*
	 *
	 * - **Field Type**: Number
	 * - **Placeholder**: 1 to 6, drives panel sequence and the indicator
	 * - **API ID Path**: project.order
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/number
	 */
	order: prismic.NumberField;
	
	/**
	 * Year field in *Project*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: 2022
	 * - **API ID Path**: project.year
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	year: prismic.KeyTextField;
	
	/**
	 * Category field in *Project*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Website
	 * - **API ID Path**: project.category
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	category: prismic.KeyTextField;
	
	/**
	 * Summary field in *Project*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Shown on the detail view, roughly 300 characters
	 * - **API ID Path**: project.summary
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	summary: prismic.RichTextField;
	
	/**
	 * Visit URL field in *Project*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: Live site
	 * - **API ID Path**: project.visit_url
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	visit_url: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * Cover field in *Project*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: Large panel image, roughly 8:5
	 * - **API ID Path**: project.cover
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	cover: prismic.ImageField<never>;
	
	/**
	 * Secondary field in *Project*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: Offset image that bleeds past the right gutter
	 * - **API ID Path**: project.secondary
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	secondary: prismic.ImageField<never>;
	
	/**
	 * Gallery field in *Project*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: project.gallery[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	gallery: prismic.GroupField<Simplify<ProjectDocumentDataGalleryItem>>;
}

/**
 * Project document from Prismic
 *
 * - **API ID**: `project`
 * - **Repeatable**: `true`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type ProjectDocument<Lang extends string = string> = prismic.PrismicDocumentWithUID<Simplify<ProjectDocumentData>, "project", Lang>;

type WorksPageDocumentDataSlicesSlice = WorksSlice

/**
 * Content for Works Page documents
 */
interface WorksPageDocumentData {
	/**
	 * Slice Zone field in *Works Page*
	 *
	 * - **Field Type**: Slice Zone
	 * - **Placeholder**: *None*
	 * - **API ID Path**: works_page.slices[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/slices
	 */
	slices: prismic.SliceZone<WorksPageDocumentDataSlicesSlice>;/**
	 * Meta Title field in *Works Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Shown in the browser tab and search results
	 * - **API ID Path**: works_page.meta_title
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_title: prismic.KeyTextField;
	
	/**
	 * Meta Description field in *Works Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Short summary for search results
	 * - **API ID Path**: works_page.meta_description
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_description: prismic.KeyTextField;
	
	/**
	 * Meta Image field in *Works Page*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: works_page.meta_image
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	meta_image: prismic.ImageField<never>;
}

/**
 * Works Page document from Prismic
 *
 * - **API ID**: `works_page`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type WorksPageDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<WorksPageDocumentData>, "works_page", Lang>;

export type AllDocumentTypes = AboutDocument | HomepageDocument | ProjectDocument | WorksPageDocument;

/**
 * Item in *About → Default → Primary → Paragraphs*
 */
export interface AboutSliceDefaultPrimaryParagraphsItem {
	/**
	 * Text field in *About → Default → Primary → Paragraphs*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: One paragraph of the about story
	 * - **API ID Path**: about.default.primary.paragraphs[].text
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	text: prismic.RichTextField;
}

/**
 * Item in *About → Default → Primary → Images*
 */
export interface AboutSliceDefaultPrimaryImagesItem {
	/**
	 * Image field in *About → Default → Primary → Images*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: Portrait crop, roughly 3:4
	 * - **API ID Path**: about.default.primary.images[].image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image: prismic.ImageField<never>;
}

/**
 * Primary content in *About → Default → Primary*
 */
export interface AboutSliceDefaultPrimary {
	/**
	 * Surface field in *About → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: Background this section sits on
	 * - **Default Value**: blush
	 * - **API ID Path**: about.default.primary.surface
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	surface: prismic.SelectField<"blush" | "ink", "filled">;
	
	/**
	 * Paragraphs field in *About → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: about.default.primary.paragraphs[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	paragraphs: prismic.GroupField<Simplify<AboutSliceDefaultPrimaryParagraphsItem>>;
	
	/**
	 * Images field in *About → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: about.default.primary.images[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	images: prismic.GroupField<Simplify<AboutSliceDefaultPrimaryImagesItem>>;
}

/**
 * Default variation for About Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type AboutSliceDefault = prismic.SharedSliceVariation<"default", Simplify<AboutSliceDefaultPrimary>, never>;

/**
 * Slice variation for *About*
 */
type AboutSliceVariation = AboutSliceDefault

/**
 * About Shared Slice
 *
 * - **API ID**: `about`
 * - **Description**: Prose column beside a scrolling image column
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type AboutSlice = prismic.SharedSlice<"about", AboutSliceVariation>;

/**
 * Primary content in *Hero → Default → Primary*
 */
export interface HeroSliceDefaultPrimary {
	/**
	 * Surface field in *Hero → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: Background this section sits on
	 * - **Default Value**: blush
	 * - **API ID Path**: hero.default.primary.surface
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	surface: prismic.SelectField<"blush" | "ink", "filled">;
	
	/**
	 * Name field in *Hero → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Set at display size across the full width
	 * - **API ID Path**: hero.default.primary.name
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	name: prismic.KeyTextField;
	
	/**
	 * Intro left field in *Hero → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Short paragraph left of the portrait
	 * - **API ID Path**: hero.default.primary.intro_left
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	intro_left: prismic.RichTextField;
	
	/**
	 * Intro right field in *Hero → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Short paragraph right of the portrait
	 * - **API ID Path**: hero.default.primary.intro_right
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	intro_right: prismic.RichTextField;
	
	/**
	 * Portrait field in *Hero → Default → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: Roughly 4:5
	 * - **API ID Path**: hero.default.primary.portrait
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	portrait: prismic.ImageField<never>;
}

/**
 * Default variation for Hero Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type HeroSliceDefault = prismic.SharedSliceVariation<"default", Simplify<HeroSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Hero*
 */
type HeroSliceVariation = HeroSliceDefault

/**
 * Hero Shared Slice
 *
 * - **API ID**: `hero`
 * - **Description**: Name at display size beneath a three-part intro row
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type HeroSlice = prismic.SharedSlice<"hero", HeroSliceVariation>;

/**
 * Primary content in *Works → Default → Primary*
 */
export interface WorksSliceDefaultPrimary {
	/**
	 * Surface field in *Works → Default → Primary*
	 *
	 * - **Field Type**: Select
	 * - **Placeholder**: Background these panels sit on
	 * - **Default Value**: ink
	 * - **API ID Path**: works.default.primary.surface
	 * - **Documentation**: https://prismic.io/docs/fields/select
	 */
	surface: prismic.SelectField<"blush" | "ink", "filled">;
	
	/**
	 * Heading field in *Works → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: Recent projects
	 * - **API ID Path**: works.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	heading: prismic.KeyTextField;
}

/**
 * Default variation for Works Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type WorksSliceDefault = prismic.SharedSliceVariation<"default", Simplify<WorksSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Works*
 */
type WorksSliceVariation = WorksSliceDefault

/**
 * Works Shared Slice
 *
 * - **API ID**: `works`
 * - **Description**: One full-viewport panel per project, queried from the Project type
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type WorksSlice = prismic.SharedSlice<"works", WorksSliceVariation>;

declare module "@prismicio/client" {
	interface CreateClient {
		(repositoryNameOrEndpoint: string, options?: prismic.ClientConfig): prismic.Client<AllDocumentTypes>;
	}
	
	interface CreateWriteClient {
		(repositoryNameOrEndpoint: string, options: prismic.WriteClientConfig): prismic.WriteClient<AllDocumentTypes>;
	}
	
	interface CreateMigration {
		(): prismic.Migration<AllDocumentTypes>;
	}
	
	namespace Content {
		export type {
			AboutDocument,
			AboutDocumentData,
			AboutDocumentDataSlicesSlice,
			HomepageDocument,
			HomepageDocumentData,
			HomepageDocumentDataSlicesSlice,
			ProjectDocument,
			ProjectDocumentData,
			ProjectDocumentDataGalleryItem,
			WorksPageDocument,
			WorksPageDocumentData,
			WorksPageDocumentDataSlicesSlice,
			AllDocumentTypes,
			AboutSlice,
			AboutSliceDefaultPrimaryParagraphsItem,
			AboutSliceDefaultPrimaryImagesItem,
			AboutSliceDefaultPrimary,
			AboutSliceVariation,
			AboutSliceDefault,
			HeroSlice,
			HeroSliceDefaultPrimary,
			HeroSliceVariation,
			HeroSliceDefault,
			WorksSlice,
			WorksSliceDefaultPrimary,
			WorksSliceVariation,
			WorksSliceDefault
		}
	}
}