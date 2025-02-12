import { GetStaticProps } from 'next/types';
import TicketTemplateEditor from '../../../../../components/ticket_template/editor';
import { TicketTemplate } from '../../../../../components/ticket_template/types';

interface CreateTicketTemplateProps {
  initialTicketTemplate: TicketTemplate;
}

const CreateTicketTemplate = ({initialTicketTemplate}: CreateTicketTemplateProps) => {

  return (
    <>
      <TicketTemplateEditor initialTicketTemplate={initialTicketTemplate} />
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const common = (await import(`../../../../../messages/${context.locale}/common.json`)).default;
  const ticket = (await import(`../../../../../messages/${context.locale}/ticket.json`)).default;

  return {
    props: {
      messages: {
        ...common,
        ...ticket,
      },
    },
  };
};

export default CreateTicketTemplate;
