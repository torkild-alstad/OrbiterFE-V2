import { validateAndParseAddress } from 'starknet'
import { CHAIN_ID } from '../config'
import tonHelper from './ton/ton_helper'
import solanaHelper from './solana/solana_helper.js'
import {
  setConnectWalletGroupKey,
  setSelectWalletDialogVisible,
  web3State,
} from '../composition/hooks'
import { compatibleGlobalWalletConf } from '../composition/walletsResponsiveData/index.js'

const checkStarknetAddress = (address) => {
  if (address?.length <= 50) {
    return false
  }
  try {
    return validateAndParseAddress(address)
  } catch (error) {
    return false
  }
}

const checkFuelsAddress = (address) => {
  const ETH_ADDRESS = new RegExp('^(0x)?[0-9a-fA-F]{64}$')
  return ETH_ADDRESS.test(address)
}

const checkEvmAddress = (address) => {
  const ETH_ADDRESS = new RegExp('^(0x)?[0-9a-fA-F]{40}$')
  return ETH_ADDRESS.test(address)
}

const openEvmConnectModal = () => {
  setSelectWalletDialogVisible(true)
  setConnectWalletGroupKey('EVM')
}

const openStarknetConnectModal = () => {
  setSelectWalletDialogVisible(true)
  setConnectWalletGroupKey('STARKNET')
}

const openSolanaConnectModal = () => {
  setSelectWalletDialogVisible(true)
  setConnectWalletGroupKey('SOLANA')
}

const tonConnectModal = async () => {
  await tonHelper.connect()
}

const openFractalConnectModal = () => {
  setSelectWalletDialogVisible(true)
  setConnectWalletGroupKey('FRACTAL')
}

const openFuelConnectModal = () => {
  setSelectWalletDialogVisible(true)
  setConnectWalletGroupKey('FUEL')
}

const openAptosConnectModal = () => {
  setSelectWalletDialogVisible(true)
  setConnectWalletGroupKey('APTOS')
}

const evmChain = [
  CHAIN_ID.zksync,
  CHAIN_ID.zksync_test,
  CHAIN_ID.imx,
  CHAIN_ID.imx_test,
  CHAIN_ID.loopring,
  CHAIN_ID.loopring_test,
]

const isSolanaChain = ({ chainId }) => {
  return (
    chainId === CHAIN_ID.solana ||
    chainId === CHAIN_ID.solana_test ||
    chainId === CHAIN_ID.eclipse_test ||
    chainId === CHAIN_ID.sonic_test
  )
}

const isTonChain = ({ chainId }) => {
  return chainId === CHAIN_ID.ton || chainId === CHAIN_ID.ton_test
}

const isStarknetChain = ({ chainId }) => {
  return chainId === CHAIN_ID.starknet || chainId === CHAIN_ID.starknet_test
}

const isFuelChain = ({ chainId }) => {
  return chainId === CHAIN_ID.fuel || chainId === CHAIN_ID.fuel_test
}

const isFractalChain = ({ chainId }) => {
  return chainId === CHAIN_ID.fractal_test
}

const isAptosChain = ({ chainId }) => {
  return chainId === CHAIN_ID.movement_test
}

const isEVMChain = ({ chainId }) => {
  const flag = evmChain.some(
    (item) => item.toLocaleLowerCase() === String(chainId).toLocaleLowerCase()
  )
  return Number(chainId) || flag
}

const isNotEVMChain = ({ chainId }) => {
  return (
    isSolanaChain({ chainId }) ||
    isTonChain({ chainId }) ||
    isStarknetChain({ chainId }) ||
    isFuelChain({ chainId }) ||
    isFractalChain({ chainId }) ||
    isAptosChain({ chainId })
  )
}

const isMiddleDecimals = ({ decimals }) => {
  const d = Number(decimals)
  return d === 8 || d === 9
}

const currentConnectChainInfo = ({ chainId }) => {
  const evmInfo = {
    address: compatibleGlobalWalletConf.value.walletPayload.walletAddress,
    open: openEvmConnectModal,
    isConnected: !!compatibleGlobalWalletConf.value.walletPayload.walletAddress,
    checkAddress: checkEvmAddress,
    walletIcon: compatibleGlobalWalletConf?.walletType?.toLocaleLowerCase(),
  }

  const satrknetInfo = {
    address: web3State.starkNet.starkNetAddress,
    open: openStarknetConnectModal,
    isConnected: !!web3State.starkNet.starkIsConnected,
    checkAddress: checkStarknetAddress,
    walletIcon: CHAIN_ID.starknet,
  }
  const solanaInfo = {
    address: web3State.solana.solanaAddress,
    open: openSolanaConnectModal,
    isConnected: !!web3State.solana.solanaIsConnected,
    checkAddress: (address) => {
      return solanaHelper.checkAddress(address)
    },
    walletIcon: solanaHelper.readWalletName() || CHAIN_ID.solana,
  }
  const tonInfo = {
    address: tonHelper.account(),
    open: tonConnectModal,
    isConnected: !!tonHelper.isConnected(),
    checkAddress: (address) => {
      return tonHelper.checkAddress(address)
    },
    walletIcon: CHAIN_ID.ton,
  }
  const fuelInfo = {
    address: web3State.fuel.fuelAddress,
    open: openFuelConnectModal,
    isConnected: !!web3State.fuel.fuelIsConnect,
    checkAddress: checkFuelsAddress,
    walletIcon: CHAIN_ID.fuel,
  }
  const fractalInfo = {
    address: web3State.fractal.fractalAddress,
    open: openFractalConnectModal,
    isConnected: !!web3State.fractal.fractalIsConnect,
    checkAddress: () => {
      return true
    },
    walletIcon: web3State.fractal.fractalWalletIcon,
  }
  const aptosInfo = {
    address: web3State.aptos.aptosAddress,
    open: openAptosConnectModal,
    isConnected: !!web3State.aptos.aptosIsConnect,
    checkAddress: () => {
      return true
    },
    walletIcon: web3State.aptos.aptosWalletIcon,
  }

  let current = null

  if (isTonChain({ chainId })) {
    current = tonInfo
  } else if (isFuelChain({ chainId })) {
    current = fuelInfo
  } else if (isSolanaChain({ chainId })) {
    current = solanaInfo
  } else if (isStarknetChain({ chainId })) {
    current = satrknetInfo
  } else if (isFractalChain({ chainId })) {
    current = fractalInfo
  } else if (isAptosChain({ chainId })) {
    current = aptosInfo
  } else if (isEVMChain({ chainId })) {
    current = evmInfo
  } else {
    current = null
  }
  return current
}

const checkAddress = ({ address, chainId }) => {
  if (!address || !chainId) return false
  const group = currentConnectChainInfo({ chainId })

  return !!group?.checkAddress(address)
}

const openConnectModal = async ({ chainId }) => {
  if (!chainId) return

  const group = currentConnectChainInfo({ chainId })

  return !!group?.open()
}

const orbiterHelper = {
  isSolanaChain,
  isFractalChain,
  isAptosChain,
  isTonChain,
  isStarknetChain,
  isFuelChain,
  isNotEVMChain,
  isEVMChain,
  isMiddleDecimals,
  checkAddress,
  openConnectModal,
  currentConnectChainInfo,
}

export default orbiterHelper
