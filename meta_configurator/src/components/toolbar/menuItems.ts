import {openUploadFileDialog, openUploadSchemaDialog} from '@/components/toolbar/uploadFile';
import {downloadFile} from '@/components/toolbar/downloadFile';
import {openClearCurrentFileDialog, openClearSchemaDialog} from '@/components/toolbar/clearFile';
import {useSessionStore} from '@/store/sessionStore';
import {ref} from 'vue';
import type {SchemaOption} from '@/packaged-schemas/schemaOption';
import {openGenerateDataDialog} from '@/components/toolbar/createSampleData';
import {getDataForMode, useCurrentData, useCurrentSchema} from '@/data/useDataLink';
import {useDataSource} from '@/data/dataSource';
import {SessionMode} from '@/store/sessionMode';
import {SETTINGS_DATA_DEFAULT} from '@/settings/defaultSettingsData';
import {useSettings} from '@/settings/useSettings';
import {PanelType} from '@/components/panelType';
import type {SettingsInterfaceRoot} from '@/settings/settingsTypes';

/**
 * Helper class that contains the menu items for the top menu bar.
 */
export class MenuItems {
  sessionStore = useSessionStore();
  public fetchedSchemas: SchemaOption[] = [];
  public showDialog = ref(false);

  private readonly onFromWebClick: () => Promise<void>;
  private readonly onFromOurExampleClick: () => void;
  private readonly handleFromURLClick: () => void;
  constructor(
    onFromSchemaStoreClick: () => Promise<void>,
    onFromOurExampleClick: () => void,
    onFromURLClick: () => void
  ) {
    this.onFromWebClick = onFromSchemaStoreClick;
    this.onFromOurExampleClick = onFromOurExampleClick;
    this.handleFromURLClick = onFromURLClick;
  }

  public getFileEditorMenuItems(settings: SettingsInterfaceRoot) {
    return [
      {
        label: 'New File',
        icon: 'fa-regular fa-file',
        items: [
          {
            label: 'New empty File',
            icon: 'fa-regular fa-file',
            command: openClearCurrentFileDialog,
          },
          {
            label: 'Generate File...',
            icon: 'fa-solid fa-gears',
            command: openGenerateDataDialog,
            disabled: true, // currently not working in the deployed version
          },
        ],
      },
      {
        label: 'Open File',
        icon: 'fa-regular fa-folder-open',
        command: () => openUploadFileDialog(getDataForMode(SessionMode.FileEditor)),
      },
      {
        label: 'Download File',
        icon: 'fa-solid fa-download',
        command: () => downloadFile(useCurrentSchema().schemaRaw.value.title ?? 'file'),
      },
      {
        separator: true,
      },
      {
        label: 'Undo',
        icon: 'fa-solid fa-rotate-left',
        key: 'undo',
        command: () => {
          useCurrentData().undoManager.undo();
        },
        disabled: () => !useCurrentData().undoManager.canUndo,
      },
      {
        label: 'Redo',
        icon: 'fa-solid fa-rotate-right',
        command: () => {
          useCurrentData().undoManager.redo();
        },
        disabled: () => !useCurrentData().undoManager.canRedo,
        key: 'redo',
      },
    ];
  }

  public getSchemaEditorMenuItems(settings: SettingsInterfaceRoot) {
    let result = [
      {
        label: 'New empty Schema',
        icon: 'fa-regular fa-file',
        items: [
          {
            label: 'New empty Schema',
            icon: 'fa-regular fa-file',
            command: openClearSchemaDialog,
          },
          {
            label: 'Infer Schema',
            icon: 'fa-solid fa-wand-magic-sparkles',
            command: () => {
              throw new Error('Not implemented yet');
            },
            disabled: true,
          },
        ],
      },
      {
        label: 'Open Schema',
        icon: 'fa-regular fa-folder-open',
        items: [
          {
            label: 'From File',
            icon: 'fa-regular fa-folder-open',
            command: openUploadSchemaDialog,
          },

          {
            label: 'From JSON Schema Store',
            icon: 'fa-solid fa-database',
            command: this.onFromWebClick,
          },
          {
            label: 'From URL',
            icon: 'fa-solid fa-globe',
            command: this.handleFromURLClick,
          },
          {
            label: 'Example Schemas',
            icon: 'fa-solid fa-database',
            command: this.onFromOurExampleClick,
          },
        ],
      },
      {
        label: 'Download Schema',
        icon: 'fa-solid fa-download',
        command: () =>
          downloadFile('schema_' + (useDataSource().userSchemaData.value.title ?? 'untitled')),
      },
      {
        separator: true,
      },
      {
        label: 'Undo',
        icon: 'fa-solid fa-rotate-left',
        command: () => {
          useCurrentData().undoManager.undo();
        },
        disabled: () => !useCurrentData().undoManager.canUndo,
        key: 'schema_undo',
      },
      {
        label: 'Redo',
        icon: 'fa-solid fa-rotate-right',
        command: () => {
          useCurrentData().undoManager.redo();
        },
        disabled: () => !useCurrentData().undoManager.canRedo,
        key: 'schema_redo',
      },
      {
        separator: true,
      },
    ];
    if (
      useSettings().panels.schema_editor.find(
        panel => panel.panelType === 'gui_editor' && panel.mode === 'file_editor'
      )
    ) {
      result.push({
        label: 'Hide preview of resulting GUI',
        icon: 'fa-regular fa-eye',
        command: () => {
          const panels = useSettings().panels;
          panels.schema_editor = panels.schema_editor.filter(
            panel =>
              !(panel.panelType === PanelType.GuiEditor && panel.mode === SessionMode.FileEditor)
          );
        },
      });
    } else {
      result.push({
        label: 'Show preview of resulting GUI',
        icon: 'fa-solid fa-eye',
        command: () => {
          const panels = settings.panels;
          panels.schema_editor.push({
            panelType: PanelType.GuiEditor,
            mode: SessionMode.FileEditor,
            size: 40,
          });
        },
      });
    }

    if (
      !useSettings().metaSchema.allowBooleanSchema ||
      !useSettings().metaSchema.allowMultipleTypes ||
      useSettings().metaSchema.objectTypesComfort ||
      !useSettings().metaSchema.showAdditionalPropertiesButton
    ) {
      result.push({
        label: 'Enable advanced schema options',
        icon: 'fa-solid fa-gauge-high',
        command: () => {
          const metaSchema = useSettings().metaSchema;
          metaSchema.allowBooleanSchema = true;
          metaSchema.allowMultipleTypes = true;
          metaSchema.objectTypesComfort = false;
          metaSchema.showAdditionalPropertiesButton = true;
        },
      });
    } else {
      result.push({
        label: 'Disable advanced schema options',
        icon: 'fa-solid fa-gauge-simple',
        command: () => {
          const metaSchema = useSettings().metaSchema;
          metaSchema.allowBooleanSchema = false;
          metaSchema.allowMultipleTypes = false;
          // do not activate objectTypesComfort, because many features are not compatible with it
          // metaSchema.objectTypesComfort = true;
          metaSchema.showAdditionalPropertiesButton = false;
        },
      });
    }

    return result;
  }

  public getSettingsMenuItems(settings: SettingsInterfaceRoot) {
    return [
      {
        label: 'Open settings file',
        icon: 'fa-regular fa-folder-open',
        command: () => {
          throw new Error('Not implemented yet');
        },
        disabled: true,
      },
      {
        label: 'Save settings file',
        icon: 'fa-regular fa-floppy-disk',
        command: () => downloadFile('metaConfiguratorSettings'),
      },
      {
        separator: true,
      },
      {
        label: 'Undo',
        icon: 'fa-solid fa-rotate-left',
        command: () => {
          useCurrentData().undoManager.undo();
        },
        disabled: () => !useCurrentData().undoManager.canUndo,
        key: 'settings_undo',
      },
      {
        label: 'Redo',
        icon: 'fa-solid fa-rotate-right',
        command: () => {
          useCurrentData().undoManager.redo();
        },
        disabled: () => !useCurrentData().undoManager.canRedo,
        key: 'settings_redo',
      },
      {
        separator: true,
      },
      {
        label: 'Restore default settings',
        icon: 'fa-solid fa-trash-arrow-up',
        command: () => {
          getDataForMode(SessionMode.Settings).setData(structuredClone(SETTINGS_DATA_DEFAULT));
        },
        key: 'settings_restore',
      },
    ];
  }
}