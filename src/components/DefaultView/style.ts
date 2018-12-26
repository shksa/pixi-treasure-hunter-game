import styled, {keyframes} from '../../styled-components'
import {ReactComponent as ReactLogo} from "../../assets/logo.svg";

export const Page = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: ${({theme}) => theme.background};
`

export const TextBlock = styled("div")<{
  color?: string, fontSize?: string, bold?: boolean, fontWeight?: string,
  marginTop?: string, marginBottom?: string, margin?: string 
}>`
  color: ${({theme, color}) => color || theme.primaryColor};
  font-size: ${({fontSize}) => fontSize};
  font-weight: ${({bold, fontWeight}) => bold ? "bold" : fontWeight};
  margin-top: ${({marginTop}) => marginTop};
  margin-bottom: ${({marginBottom}) => marginBottom};
  margin: ${({margin}) => margin};
`

export const Text = styled(TextBlock)`
  display: inline;
`

export const Header = styled.div`
  padding: 2em;
  text-align: center;
  font-size: 1.7em;
  color: ${({theme}) => theme.primaryColor};
  @media (max-width: 468px) {
    font-size: 1.2em;
  }
  @media (min-width: 468px) and (max-width: 768px) {
    font-size: 1.5em;
  } 
`

export const Body = styled.div`
  flex: 1;
  display:flex;
  justify-content: center;
  align-items: center;
  padding: 2em;
`

const Spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`
const Orbit = keyframes`
  to {
    stroke-dashoffset: 50px;
  }
`

const RotateX = keyframes`
  from {
    transform: rotateX(0deg);
  }
  to {
    transform: rotateX(360deg);
  }
`

const RotateY = keyframes`
  from {
    transform: rotateY(0deg);
  }
  to {
    transform: rotateY(360deg);
  }
`

export const AppLogoWrapper = styled.div`
  animation: ${Spin} 10s infinite ease-in-out;
`

export const AppLogo = styled(ReactLogo)`
  @media (max-width: 468px) {
    width: 240px;
    height: 240px;
  }
  @media (min-width: 468px) and (max-width: 768px) {
    width: 420px;
    height: 420px;
  } 
  width: 500px;
  height: 500px;
  g {
    fill: salmon;  
    /* animation: ${RotateX} 10s infinite linear; */
  }
  g circle {
    animation: ${RotateX} 5s infinite linear;
  }
  path {
    stroke: palegoldenrod;
    stroke-width: 10px;
    fill: none;
    stroke-dasharray: 35px 15px;
    animation: ${Orbit} 1s infinite linear;
  }
  animation: ${RotateY} 5s infinite linear;
`
