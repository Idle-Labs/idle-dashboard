import React from "react";
import styles from './ModalCard.module.scss';
import { Box, Flex, Card, Button, Heading, Image } from "rimble-ui";

const ModalCard = ({children, closeFunc, ...props}) => (
  <Card
    p={0}
    border={0}
    mx={'auto'}
    my={'auto'}
    height={'auto'}
    borderRadius={2}
    overflow={'auto'}
    width={ props.width ? props.width : 'auto' }
    minWidth={ props.minWidth ? props.minWidth : 'auto' }
    maxWidth={ props.maxWidth ? props.maxWidth : '960px'}
  >
    <Box
      top={'0'}
      right={'0'}
      zIndex={999}
      position={"absolute"}
    >
      <Button.Text
        icononly
        icon={"Close"}
        size={'2.5em'}
        onClick={closeFunc}
        mainColor={ props.mainColor ? props.mainColor :  'copyColor' }
      />
    </Box>
    <Flex
      height={'100%'}
      flex={'1 1 auto'}
      flexDirection={'column'}
      className={[ props.bgLayer ? styles.bg : null]}
      style={{
        overflow: 'auto',
        background: props.background ? props.background : null,
      }}
      backgroundColor={'dashboardBg'}
    >
      <Flex
        zIndex={1}
        width={'100%'}
        height={'100%'}
        position={'absolute'}
      >
        <Flex
          className={[styles.bg,styles['bg-bottom-right']]}
        />
        <Flex
          className={[styles.bg,styles['bg-noise']]}
        />
      </Flex>
      <Flex
        zIndex={2}
        height={'100%'}
        flex={'1 1 auto'}
        style={{
          overflow: 'auto',
        }}
        position={'relative'}
        flexDirection={'column'}
      >
        {children}
      </Flex>
    </Flex>
  </Card>
);

ModalCard.Header = (props) => (
  <Box
    mb={2}
    width={1}
    pb={[2,2]}
    pt={ props.pt ? props.pt : (props.icon ? 3 : [5,3]) }
  >
    <Flex
      px={[1,2]}
      alignItems={'center'}
      flexDirection={'column'}
    >
      { props.icon && <Image width={ props.iconHeight ? props.iconHeight : '40px' } src={props.icon} /> }
      <Heading.h3
        mb={0}
        fontSize={[3,3]}
        color={'primary'}
        textAlign={'center'}
        fontFamily={'titles'}
        mt={props.icon ? 2 : 0}
        {...props.titleProps}
      >
        {props.title}
      </Heading.h3>
      {
        props.subtitle &&
        <Heading.h4
          pt={[1,2]}
          fontWeight={2}
          fontSize={[2,2]}
          lineHeight={1.5}
          color={'dark-gray'}
          textAlign={'center'}
          {...props.subtitleProps}
        >
          {props.subtitle}
        </Heading.h4>
      }
      {
        props.subtitle2 &&
        <Heading.h4 pt={0} fontSize={[2,2]} textAlign={'center'} fontWeight={2} lineHeight={1.5} color={'dark-gray'}>
          {props.subtitle2}
        </Heading.h4>
      }
    </Flex>
  </Box>
);

ModalCard.Body = ({children, ...props}) => (
  <Box
    width={1}
    px={[3,5]}
    {...props}
  >
    {children}
  </Box>
);
/*
ModalCard.Body = ({children, ...props}) => (
  <Flex flex={'1 1 auto'} style={{ overflow: 'auto' }} >
    <Box width={1} px={[4,5]} py={[3,4]} m={'auto'}>
      {children}
    </Box>
  </Flex>
);
*/

ModalCard.Footer = ({children, ...props}) => (
  <Flex
    py={3}
    px={[0,3]}
    borderTop={0}
    flex={'1 0 auto'}
    justifyContent={'center'}
    borderColor={'light-gray'}
  >
    {children}
  </Flex>
);


ModalCard.BackButton = ({onClick, ...props}) => (
  <Box
    position={'absolute'}
    top={'0'}
    left={'0'}
    m={3}
    bg={'white'}
  >
    <Button.Outline
      onClick={onClick}
      icononly
      icon={'ArrowBack'}
      size={'2.5em'}
    />
  </Box>
);

export default ModalCard;
