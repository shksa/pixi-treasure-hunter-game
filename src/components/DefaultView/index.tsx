import React from 'react'
import * as s from './style'

export default function DefaultView() {
  return (
    <s.Page>
      <s.Header>
        <s.TextBlock bold >CRA with Typescript and Styled-Components</s.TextBlock>
        <s.TextBlock color="black" marginTop="2em">
          Important config options: 
        </s.TextBlock>
        <s.TextBlock marginTop="1em">
          <s.Text bold color="black">skipLibCheck</s.Text> is set to <s.Text bold color="black">true</s.Text>
        </s.TextBlock>
        <s.TextBlock>
          <s.Text bold color="black">
            ForkTsCheckerWebpackPlugin
          </s.Text> is set in <s.Text bold color="black">
            async: true
          </s.Text> and <s.Text bold color="black">
            silent: false
          </s.Text>
        </s.TextBlock>
      </s.Header>
      <s.Body>
        <s.AppLogoWrapper><s.AppLogo /></s.AppLogoWrapper>
      </s.Body>
    </s.Page>
  )
}
