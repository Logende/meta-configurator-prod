<!--
List dropdown for enum properties, also used for properties with multiple examples.
-->
<script setup lang="ts">
import {computed, type Ref, ref} from 'vue';
import Dropdown from 'primevue/dropdown';
import _ from 'lodash';
import {dataToString} from '@/utility/dataToString';
import type {PathElement} from '@/utility/path';
import type {ValidationResult} from '@/schema/validationService';
import {JsonSchemaWrapper} from '@/schema/jsonSchemaWrapper';
import {isReadOnly} from '@/components/panels/gui-editor/configTreeNodeReadingUtils';
import {findSuggestionsForSearchTerm} from "@/rdf/useRdf";

const props = defineProps<{
  propertyName: PathElement;
  propertySchema: JsonSchemaWrapper;
  propertyData: any | undefined;
  validationResults: ValidationResult;
}>();

const emit = defineEmits<{
  (e: 'update:propertyData', newValue: any): void;
}>();

const valueProperty = computed({
  get() {
    return valueToSelectionOption(props.propertyData);
  },
  set(newValue: {name: string; value: any} | string | undefined) {



    if (typeof newValue !== 'object') {
      updatePossibleValues(newValue)
      emit('update:propertyData', newValue);
      return;
    }
    updatePossibleValues(newValue.value)
    emit('update:propertyData', newValue?.value);
  },
});

async function updatePossibleValues(userInput: string | undefined) {
  if (!userInput) {
    possibleValues.value = [];
    return;
  }
  possibleValues.value = await findSuggestionsForSearchTerm(userInput);
}

const possibleValues: Ref<string[]> = ref([]);





function valueToSelectionOption(value: any): any {
  if (value === undefined) {
    return undefined;
  }
  // check if value is one of the possible values
  if (!possibleValues.value.some(possibleValue => _.isEqual(possibleValue, value))) {
    return value; // don't wrap in object if not in possible values, otherwise the dropdown cannot correctly select the value
  }
  const formattedValue = dataToString(value);

  return {
    name: formattedValue,
    value: value,
  };
}

const allOptions = computed(() => {
  return possibleValues.value.map(val => valueToSelectionOption(val));
});

</script>

<template>
  <Dropdown
    class="tableInput w-full"
    :class="{'underline decoration-wavy decoration-red-600': !props.validationResults.valid}"
    v-model="valueProperty"
    :editable="true"
    :options="allOptions"
    :disabled="isReadOnly(props.propertySchema)"
    optionLabel="name"
    @keydown.stop
    :placeholder="`Select ${props.propertyName}`" />
</template>

<style scoped>
.tableInput {
  border: none;
  box-shadow: none;
}
::placeholder {
  color: #a8a8a8;
}
</style>
