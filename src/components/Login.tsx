
import {
  EuiButton,
  EuiFieldText,
  EuiForm,
  EuiFormRow,

} from '@elastic/eui';
import '@elastic/eui/dist/eui_theme_light.css';

import './login.scss';

function Login() {
   
    return (
        <div className="signIn"> 

            <div className="content"> 
        
            <h2>Login</h2> 
        
                    <EuiForm className='form'  component="form">
                        <EuiFormRow  label="Username" >
                            <EuiFieldText name="username" />
                        </EuiFormRow>
                        <EuiFormRow label="Password" >
                            <EuiFieldText name="password" />
                        </EuiFormRow>
                
                        <EuiButton className='euiButton' type="submit" fill>
                        Login
                        </EuiButton>
                </EuiForm>
            </div>
      </div>
    );
  }

export default Login
