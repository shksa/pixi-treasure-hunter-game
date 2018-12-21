import styled, {keyframes} from '../../styled-components'
import AppLogo from "../../assets/logo.svg";

export const Page = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`

export const Header = styled.div`
  padding: 2em;
  text-align: center;
  font-size: 1.5em;
`

export const Body = styled.div`
  flex: 1;
  display:flex;
  justify-content: center;
  align-items: center;
  padding: 2em;
`

const AppLogoSpin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

export const Logo = styled.img.attrs({
  src: AppLogo
})`
  animation-name: ${AppLogoSpin};
  animation-duration: 20s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  height: 70%;
  width: 70%;
`

