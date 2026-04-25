declare module '@wangeditor/editor-for-vue' {
  import { DefineComponent } from 'vue';
  import { IDomEditor } from '@wangeditor/editor';

  export const Editor: DefineComponent<{
    modelValue: string;
    defaultConfig?: any;
    mode?: 'default' | 'simple';
    disabled?: boolean;
    readonly?: boolean;
    onCreated?: (editor: IDomEditor) => void;
    onChange?: (editor: IDomEditor) => void;
    onFocus?: (editor: IDomEditor) => void;
    onBlur?: (editor: IDomEditor) => void;
    onDestroy?: (editor: IDomEditor) => void;
    onMaxlength?: (editor: IDomEditor) => void;
    onOverflow?: (editor: IDomEditor) => void;
    customAlert?: (info: string, type: string) => void;
  }>;

  export const Toolbar: DefineComponent<{
    editor?: IDomEditor;
    defaultConfig?: any;
    mode?: 'default' | 'simple';
  }>;

  export default Editor;
}
