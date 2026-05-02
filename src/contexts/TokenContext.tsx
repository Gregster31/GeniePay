import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import type { TokenSymbol } from '@/config/tokenConfig';
import { getSupportedTokens } from '@/config/tokenConfig';

interface TokenContextValue {
  selectedToken: TokenSymbol;
  setSelectedToken: (token: TokenSymbol) => void;
}

const TokenContext = createContext<TokenContextValue>({
  selectedToken: 'ETH',
  setSelectedToken: () => {},
});

export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { chain } = useAccount();
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>('ETH');

  useEffect(() => {
    const tokens = getSupportedTokens(chain?.id);
    if (tokens.length > 0 && !tokens.includes(selectedToken)) {
      setSelectedToken(tokens[0]);
    }
  }, [chain?.id]);

  return (
    <TokenContext.Provider value={{ selectedToken, setSelectedToken }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useSelectedToken = () => useContext(TokenContext);
