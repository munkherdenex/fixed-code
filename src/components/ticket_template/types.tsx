export type TicketTemplate = {
  id: number;
  name: string;
  description?: string;
  fields?: TicketTemplateField[];
};

export type TicketTemplateField = {
  id: number;
  attr_name: string;
  name: string;
  type: string;
  config: {
    helpText?: string;
    isRequired: boolean;
    isMultiline?: boolean;
    min?: number;
    max?: number;
    step?: number;
    choices?: {
      id: string;
      value: string;
      text: string;
    }[];
  };
};
