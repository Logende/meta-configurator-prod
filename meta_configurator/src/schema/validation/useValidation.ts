import type {ValidationResult} from '@/schema/validation/validationService';
import {ValidationService} from '@/schema/validation/validationService';
import {computed} from 'vue';
import {useCurrentData, useCurrentSchema} from '@/data/useDataLink';

const currentValidationService = computed(() => {
  const schema = useCurrentSchema().schemaRaw.value;
  console.log("set validation service schema to ", schema)
  return new ValidationService(schema ?? {});
});

export function useValidationService() {
  return currentValidationService.value;
}

const currentValidationResult = computed(() => {
  console.log("validate for data ", useCurrentData().data.value, " with schema ", useValidationService().topLevelSchema)
  return useValidationService().validate(useCurrentData().data.value);
});

export function useValidationResult(): ValidationResult {
  return currentValidationResult.value;
}
