import type {SettingsInterfaceMetaSchema} from "@/settings/settingsTypes";
import type {JsonSchemaType, TopLevelSchema} from "@/schema/jsonSchemaType";
import {META_SCHEMA_SIMPLIFIED} from "@/packaged-schemas/metaSchemaSimplified";

export function buildMetaSchema(metaSchemaSettings: SettingsInterfaceMetaSchema): TopLevelSchema {

    let metaSchema: TopLevelSchema = META_SCHEMA_SIMPLIFIED;

    if (!metaSchemaSettings.allowBooleanSchema) {
        metaSchema.$defs!.jsonSchema = DEF_JSON_SCHEMA_WITHOUT_BOOLEAN_SCHEMA;
    }
    if (!metaSchemaSettings.allowMultipleTypes) {
        metaSchema.$defs!.typeDefinition = DEF_TYPE_DEFINITION_WITHOUT_MULTIPLE_TYPES;
    }
    if (!metaSchemaSettings.showButtonToAddAdditionalProperties) {
        metaSchema.$defs!.objectSubSchema!.metaConfigurator = {
            hideAddPropertyButton: true,
        }
    }



    return metaSchema
}



const DEF_JSON_SCHEMA_WITHOUT_BOOLEAN_SCHEMA = {
    title: 'Json schema',
    $ref: '#/$defs/objectSubSchema',
    $comment:
        'This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.',
}

const DEF_TYPE_DEFINITION_WITHOUT_MULTIPLE_TYPES = {
    properties: {
        type: {
            $ref: '#/$defs/simpleTypes',
        },
    },
}