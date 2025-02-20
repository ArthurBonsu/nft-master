const React, { useCallback } =require( 'react');
const { withRouter, NavLink } =require( 'react-router-dom');
const { useTranslation } =require( 'react-i18next');
const styled =require('styled-components');
const { transparentize, darken } =require( 'polished');

const { useWeb3React, useBodyKeyDown }=require( '../../hooks');
const { useAddressBalance } =require( '../../contexts/Balances');
const { isAddress } =require( '../../utils');
const {
  useBetaMessageManager,
  useSaiHolderMessageManager,
  useGeneralDaiMessageManager
} =require( '../../contexts/LocalStorage');
const { Link } from=require( '../../theme/components');




//import React, { useCallback } from 'react'
//import { withRouter, NavLink } from 'react-router-dom'
//import { useTranslation } from 'react-i18next'
//import styled from 'styled-components'
//import { transparentize, darken } from 'polished'

//import { useWeb3React, useBodyKeyDown } from '../../hooks'
//import { useAddressBalance } from '../../contexts/Balances'
//import { isAddress } from '../../utils'
//import {
//  useBetaMessageManager,
//  useSaiHolderMessageManager,
//  useGeneralDaiMessageManager
//} from '../../contexts/LocalStorage'
//import { Link } from '../../theme/components'

const tabOrder = [
  {
    // for the swap button
    path: '/swap',
    textKey: 'swap',
    regex: /\/swap/
  },
  // for the send button
  {
    path: '/send',
    textKey: 'send',
    regex: /\/send/
  },
   // for adding liquididty button
  {
    path: '/add-liquidity',
    textKey: 'pool',
    regex: /\/add-liquidity|\/remove-liquidity|\/create-exchange.*/
  }
]

 // style for beta message, wrapping around the betta message
const BetaMessage = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  cursor: pointer;
  flex: 1 0 auto;
  align-items: center;
  position: relative;
  padding: 0.5rem 1rem;
  padding-right: 2rem;
  margin-bottom: 1rem;
  border: 1px solid ${({ theme }) => transparentize(0.6, theme.wisteriaPurple)};
  background-color: ${({ theme }) => transparentize(0.9, theme.wisteriaPurple)};
  border-radius: 1rem;
  font-size: 0.75rem;
  line-height: 1rem;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ theme }) => theme.wisteriaPurple};

  &:after {
    content: '✕';
    top: 0.5rem;
    right: 1rem;
    position: absolute;
    color: ${({ theme }) => theme.wisteriaPurple};
  }
`


// button around dai message, the style around the dai
const DaiMessage = styled(BetaMessage)`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  word-wrap: wrap;
  overflow: visible;
  white-space: normal;
  padding: 1rem 1rem;
  padding-right: 2rem;
  line-height: 1.2rem;
  cursor: default;
  color: ${({ theme }) => theme.textColor};
  div {
    width: 100%;
  }
  &:after {
    content: '';
  }
`
     // style for the close button
const CloseIcon = styled.div`
  width: 10px !important;
  top: 0.5rem;
  right: 1rem;
  position: absolute;
  color: ${({ theme }) => theme.wisteriaPurple};
  :hover {
    cursor: pointer;
  }
`
 // the header for the warning 
const WarningHeader = styled.div`
  margin-bottom: 10px;
  font-weight: 500;
  color: ${({ theme }) => theme.uniswapPink};
`

// the footer design for the warning
const WarningFooter = styled.div`
  margin-top: 10px;
  font-size: 10px;
  text-decoration: italic;
  color: ${({ theme }) => theme.greyText};
`
// The tabs information
const Tabs = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  height: 2.5rem;
  background-color: ${({ theme }) => theme.concreteGray};
  border-radius: 3rem;
  /* border: 1px solid ${({ theme }) => theme.mercuryGray}; */
  margin-bottom: 1rem;
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: center;
  height: 2.5rem;
  border: 1px solid ${({ theme }) => transparentize(1, theme.mercuryGray)};
  flex: 1 0 auto;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.doveGray};
  font-size: 1rem;
  box-sizing: border-box;

  &.${activeClassName} {
    background-color: ${({ theme }) => theme.inputBackground};
    border-radius: 3rem;
    border: 1px solid ${({ theme }) => theme.mercuryGray};
    box-shadow: 0 4px 8px 0 ${({ theme }) => transparentize(0.95, theme.shadowColor)};
    box-sizing: border-box;
    font-weight: 500;
    color: ${({ theme }) => theme.royalBlue};
    :hover {
      /* border: 1px solid ${({ theme }) => darken(0.1, theme.mercuryGray)}; */
      background-color: ${({ theme }) => darken(0.01, theme.inputBackground)};
    }
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.royalBlue)};
  }
`

// NavigationalTabls is main funcrion
function NavigationTabs({ location: { pathname }, history }) {
  const { t } = useTranslation()

  const [showBetaMessage, dismissBetaMessage] = useBetaMessageManager()

  const [showGeneralDaiMessage, dismissGeneralDaiMessage] = useGeneralDaiMessageManager()

  const [showSaiHolderMessage, dismissSaiHolderMessage] = useSaiHolderMessageManager()

  const { account } = useWeb3React()

  const daiBalance = useAddressBalance(account, isAddress('0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359'))

  const daiPoolTokenBalance = useAddressBalance(account, isAddress('0x09cabEC1eAd1c0Ba254B09efb3EE13841712bE14'))

  const onLiquidityPage = pathname === '/pool' || pathname === '/add-liquidity' || pathname === '/remove-liquidity'


  // navigate information here

  //This call back functions sets the action whenever the tabs are clicked
  const navigate = useCallback(
    direction => {
      // we want to grab the tab index here
      // we create the index using the regular expression
      const tabIndex = tabOrder.findIndex(({ regex }) => pathname.match(regex))
      // We push it into the links already visited
                      // We know throught the taborder created
      history.push(tabOrder[(tabIndex + tabOrder.length + direction) % tabOrder.length].path)
    },
    [pathname, history]
  )

  // For navigating to previous and the next tabs. This is used to show the next link and previous links

  const navigateRight = useCallback(() => {
    navigate(1)
  }, [navigate])
  const navigateLeft = useCallback(() => {
    navigate(-1)
  }, [navigate])

  // Keyboard alternative for going back and forth the arrow
  useBodyKeyDown('ArrowRight', navigateRight)
  useBodyKeyDown('ArrowLeft', navigateLeft)

  const providerMessage =
  // showing the sai holder message, show the general message
  showSaiHolderMessage && daiPoolTokenBalance && !daiPoolTokenBalance.isZero() && onLiquidityPage
    // show general message
  const generalMessage = showGeneralDaiMessage && daiBalance && !daiBalance.isZero()

  return (
    // The tabs that will be displayed containse the info of the path selected
    <>
      <Tabs>
        
        {tabOrder.map(({ path, textKey, regex }) => (
          <StyledNavLink key={path} to={path} isActive={(_, { pathname }) => pathname.match(regex)}>
            {t(textKey)}
          </StyledNavLink>
        ))}
      </Tabs>
      {providerMessage && (
        <DaiMessage>
          <CloseIcon onClick={dismissSaiHolderMessage}>✕</CloseIcon>
          <WarningHeader>Missing your DAI?</WarningHeader>
          <div>
            Don’t worry, check the{' '}
            <Link href={'/remove-liquidity?poolTokenAddress=0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359'}>
              SAI liquidity pool.
            </Link>{' '}
            Your old DAI is now SAI. If you want to migrate,{' '}
            <Link href="/remove-liquidity?poolTokenAddress=0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359">
              remove your SAI liquidity,
            </Link>{' '}
            migrate using the <Link href="https://migrate.makerdao.com/">migration tool</Link> then add your migrated
            DAI to the{' '}
            <Link href="add-liquidity?token=0x6B175474E89094C44Da98b954EedeAC495271d0F">new DAI liquidity pool.</Link>
          </div>
          <WarningFooter>
            <Link href="https://blog.makerdao.com/looking-ahead-how-to-upgrade-to-multi-collateral-dai/">
              Read more
            </Link>{' '}
            about this change on the official Maker blog.
          </WarningFooter>
        </DaiMessage>
      )}
      {generalMessage && !providerMessage && (
        <DaiMessage>
          <CloseIcon onClick={dismissGeneralDaiMessage}>✕</CloseIcon>
          <WarningHeader>DAI has upgraded!</WarningHeader>
          <div>
            Your old DAI is now SAI. To upgrade use the{' '}
            <Link href="https://migrate.makerdao.com/">migration tool.</Link>
          </div>
        </DaiMessage>
      )}
      
       {showBetaMessage && (
        <BetaMessage onClick={dismissBetaMessage}>
          <span role="img" aria-label="warning">
            💀
          </span>{' '}
          {t('betaWarning')}
        </BetaMessage>
      )}
    </>
  )
}

export default withRouter(NavigationTabs)
