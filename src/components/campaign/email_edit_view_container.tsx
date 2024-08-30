

import { useRouter } from "next/router";
import { useState } from "react";
import useGetTemplates, { Template } from "../../hooks/useGetTemplates";
import ViewEmailLayout from "./view_email_editor";
import EditEmailLayout from "./edit_email_layout";
import { EuiFlexGroup, EuiFlexItem } from "@elastic/eui";

const EmailLayouts = () => {
    const router = useRouter();
    const { data } = useGetTemplates<Template>(
        router.query.id,
    );
    const [isViewEmail, setisViewEmail] = useState(true);

    const setView = (res: boolean) => {
        setisViewEmail(res);
    }
    return (
        <>
            <EuiFlexGroup>
                <EuiFlexItem>
                    <EuiFlexItem>
                        {
                            isViewEmail ? <ViewEmailLayout setView={setView} templateStatus={data.status} /> : <EditEmailLayout templateStatus={data.status} setView={setView} />
                        }
                    </EuiFlexItem>
                </EuiFlexItem >
            </EuiFlexGroup >
        </>
    );
};

export default EmailLayouts;

