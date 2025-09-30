-- cabal install template-haskell
--
-- Lens is implementation of most common of optics.
--
-- Real makeLens implementation more complex supporting all of Haskell syntax
-- cases for creating types.
--
{-# LANGUAGE Rank2Types #-}
{-# LANGUAGE TemplateHaskell #-}
module Lens where

import Language.Haskell.TH

type Lens s t a b = forall f . Functor f => (a -> f b) -> s -> f t
type Lens" s a = Lens s s a a

lens :: (s -> a) -> (s -> b -> t) -> Lens s t a b
lens getter setter = \afb s -> setter s <$> afb (getter s)

fieldLens :: Name -> (Name, a, Type) -> Q [Dec]
fieldLens s (v, _, a) = do
  sVar <- newName "s"
  bVar <- newName "b"
  let setter = return $ LamE [VarP sVar, VarP bVar] $ RecUpdE (VarE sVar) [(v, VarE bVar)]
  body <- NormalB <$> [| lens $(return $ VarE v) $setter |]
  let fn = mkName $ tail $ nameBase v
  return [ SigD fn (AppT (AppT (ConT $ mkName "Lens"") (ConT s)) a)
         , FunD fn [Clause [] body []]
         ]

makeLens :: Name -> Q [Dec]
makeLens s = do
  (TyConI (DataD _ _ _ _ [RecC _ cs] _)) <- reify s
  concat <$> mapM (fieldLens s) cs
