export interface CodeFile {
  id: string;
  name: string;
  content: string;
}

export interface CodePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface FileTabProps {
  file: CodeFile;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export interface NewFileFormProps {
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  height: number;
}