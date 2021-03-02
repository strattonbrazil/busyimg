import React from "react";
import { Button, Container, Icon, Menu } from "semantic-ui-react";

interface ArrowBarProps
{
  imageIndex: number;
  numImages: number;
  prevHref: string;
  nextHref: string;
}

const ArrowBar = (props: ArrowBarProps) => {
  return (
    <Container className="centered">
      <Menu>
        <Menu.Item>
          <a href={props.prevHref}>
            <Button icon labelPosition='left'>prev<Icon name="arrow left" /></Button>
         </a>
        </Menu.Item>
        <Menu.Item>
          <div>
            <b>{props.imageIndex+1}</b> <i>of</i> <b>{props.numImages}</b>
          </div>          
        </Menu.Item>
        <Menu.Item>
          <a href={props.nextHref}>
            <Button icon labelPosition='right'>next<Icon name="arrow right" /></Button>
          </a>
        </Menu.Item>                
      </Menu>
    </Container>
  )
}

export { ArrowBar };
export type { ArrowBarProps };