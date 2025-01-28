import TicketTemplateEditor from '../../../../../components/ticket_template/editor';
import { TicketTemplate } from '../../../../../components/ticket_template/types';

interface CreateTicketTemplateProps {
  initialTicketTemplate: TicketTemplate;
}

const CreateTicketTemplate = ({initialTicketTemplate}: CreateTicketTemplateProps) => {

  return (
    <>
      hi
      <TicketTemplateEditor initialTicketTemplate={initialTicketTemplate} />
    </>
  );
};

export default CreateTicketTemplate;
