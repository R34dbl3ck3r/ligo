import { BaseScreen } from './base.screen';
import { by } from '@utils/selectors';
import { MobileUser } from '@data/users';

/** Login (se accede desde el menú lateral). */
class LoginScreen extends BaseScreen {
  constructor() {
    super(by.id('loginBtn'));
  }

  get usernameInput(): ChainablePromiseElement {
    return $(by.id('nameET'));
  }

  get passwordInput(): ChainablePromiseElement {
    return $(by.id('passwordET'));
  }

  get loginButton(): ChainablePromiseElement {
    return $(by.id('loginBtn'));
  }

  get usernameError(): ChainablePromiseElement {
    return $(by.id('nameErrorTV'));
  }

  get passwordError(): ChainablePromiseElement {
    return $(by.id('passwordErrorTV'));
  }

  errorFor(field: 'username' | 'password'): ChainablePromiseElement {
    return field === 'username' ? this.usernameError : this.passwordError;
  }

  async login(username: string, password: string): Promise<void> {
    await this.type(this.usernameInput, username);
    await this.type(this.passwordInput, password);
    await this.tap(this.loginButton);
  }

  async loginAs(user: MobileUser): Promise<void> {
    await this.login(user.username, user.password);
  }
}

export default new LoginScreen();
