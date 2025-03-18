import React from "react";
import AuthenticatorHelp from "app/_components/Help/AuthenticatorHelp";
import ClientCard from "./ClientCard";
import { SectionHeader } from "@tapis/tapisui-common";

const Menu: React.FC = () => {

    return( 
    <div>
        <SectionHeader>
    Authenticator
            <AuthenticatorHelp/>
        </SectionHeader>
    </div>
    )
}

export default Menu;