import {useDataSource} from '@/data/dataSource';
import {dataAt} from "@/utility/resolveDataAtPath";
import type {Path} from "@/utility/path";
import _ from 'lodash';
import {pathToString} from "@/utility/pathUtils";
import type {SettingsInterfaceRoot} from "@/settings/settingsTypes";



/**
 * Use this hook to access the settings data for reading.
 */
export function useSettings(): SettingsInterfaceRoot {
  return useDataSource().settingsData.value;
}

export function setSettings(settings: SettingsInterfaceRoot): void {
  useDataSource().settingsData.value = settings;
}

export function getSetting(path: Path): any | undefined {
  return dataAt(path, useSettings());
}

export function setSetting(path: Path, value: any): void {
  _.set(useSettings(), pathToString(path), value);
}
