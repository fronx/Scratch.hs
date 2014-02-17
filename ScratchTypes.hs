module SampleTypes where

import CustomBlocks as User

type SpriteId  = Int
type CostumeId = Int
type Key       = Char
type Message   = String

data Motion = Move             { steps   :: Value }
            | TurnRight        { degrees :: Value }
            | TurnLeft         { degrees :: Value }
            | PointInDirection { degrees :: Value }
            | PointTowards     { sprite  :: SpriteId }

data Looks = Show
           | Hide
           | ChangeSizeBy   { pixels  :: Value }
           | SetSizeTo      { percent :: Value }
           | SwitchCostumTo { costume :: CostumeId }
           | NextCostume

data Condition = Value :< Value
               | Value := Value
               | Value :> Value
               | Condition :&& Condition
               | Condition :|| Condition
               | Not Condition

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

data Control = IfThenElse Condition Statements Statements
             | IfThen     Condition Statements
             | Repeat     Int       Statements

data SendEvent = Broadcast        Message
               | BroadcastAndWait Message

type Custom = User.BlockId

data Block = Motion    Motion
           | Looks     Looks
           | Control   Control
           | SendEvent SendEvent
           | Custom    Custom

data Event = StartClicked
           | KeyPressed { key :: Key }
           | ClickThis
           | ReceiveMessage Message

data Terminator = DeleteThisClone
                | Forever Statements
                | Stop

data Statements = Block :>> Statements
                | Statements :>| Terminator
                | SNil

data Script = Script { when :: Event
                     , run  :: Statements }

type Program = [ Script ]
