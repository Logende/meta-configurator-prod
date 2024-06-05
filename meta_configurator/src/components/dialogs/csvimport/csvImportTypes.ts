import {ref, type Ref} from 'vue';
import {jsonPointerToPathTyped} from '@/utility/pathUtils';
import type {Path} from '@/utility/path';

export class CsvImportColumnMappingData {
  constructor(public index: number, public name: string, pathBeforeRowIndex: Ref<string>) {
    this.pathBeforeRowIndex = pathBeforeRowIndex;
    this.pathAfterRowIndex = ref(columnNameToElementId(this.name));
    this.titleInSchema = ref(this.name);
  }

  public pathBeforeRowIndex: Ref<string>;
  public pathAfterRowIndex: Ref<string>;
  public titleInSchema: Ref<string>;

  public getPathForJsonDocument(rowIndex: number): Path {
    return jsonPointerToPathTyped(
      '/' + this.pathBeforeRowIndex + '/' + rowIndex + '/' + this.pathAfterRowIndex
    );
  }
}

function columnNameToElementId(columnName: string): string {
  // remove everything inside parenthesis or brackets (and parenthesis and brackets themselves), trim whitespaces outside and replace whitespaces inside with underscores. Also transform to lower case. And remove all special characters.
  return columnName
    .replace(/[\[\(].*?[\]\)]/g, '')
    .trim()
    .replace(/\s/g, '_')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '');
}
