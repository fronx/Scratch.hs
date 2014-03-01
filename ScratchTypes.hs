{-# LANGUAGE GADTs, RankNTypes #-}
module ScratchTypes where

import CustomBlocks as User

type SpriteId  = Int
type CostumeId = Int
type Key       = Char
type Message   = String

data Condition = Value :< Value
               | Value := Value
               | Value :> Value
               | Condition :&& Condition
               | Condition :|| Condition
               | Not Condition
               deriving (Read, Show)

data Value = Num Double
           | Str String
           | Value :+ Value
           | Value :- Value
           | Value :* Value
           | Value :/ Value
           | Mod    Value Value
           | Round  Value Value
           | Join   Value Value
           | Letter Int   Value
           | Length Value
           deriving (Read, Show)

type Custom = User.BlockId

-- phantom types
data Motion
data Looks
data Control
data SendEvent

data Block a where
  Move             :: Value    -> Block Motion
  TurnRight        :: Value    -> Block Motion
  TurnLeft         :: Value    -> Block Motion
  PointInDirection :: Value    -> Block Motion
  PointTowards     :: SpriteId -> Block Motion

  Show           ::               Block Looks
  Hide           ::               Block Looks
  ChangeSizeBy   :: Value      -> Block Looks
  SetSizeTo      :: Value      -> Block Looks
  SwitchCostumTo :: CostumeId  -> Block Looks
  NextCostume    ::               Block Looks

  IfThenElse :: Condition -> Statements -> Statements -> Block Control
  IfThen     :: Condition -> Statements               -> Block Control
  Repeat     :: Int       -> Statements               -> Block Control

  Broadcast        :: Message  -> Block SendEvent
  BroadcastAndWait :: Message  -> Block SendEvent

type AnyBlock = forall a. Block a

data Event = StartClicked
           | KeyPressed { key :: Key }
           | ClickThis
           | ReceiveMessage Message
           deriving (Read, Show)

data Terminator = DeleteThisClone
                | Forever Statements
                | Stop

data Statements = AnyBlock :>> Statements
                | Statements :>| Terminator
                | SNil

data Script = Script { when :: Event
                     , run  :: Statements }

type Program = [ Script ]
