module SampleTypes where

type SpriteId  = Int
type CostumeId = Int
type Key       = Char
type Message   = String
type BlockId   = String

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

data Block
  -- Motion
  = Move             { steps   :: Value }
  | TurnRight        { degrees :: Value }
  | TurnLeft         { degrees :: Value }
  | PointInDirection { degrees :: Value }
  | PointTowards     { sprite  :: SpriteId }
  -- Looks
  | Show
  | Hide
  | ChangeSizeBy   { pixels  :: Value }
  | SetSizeTo      { percent :: Value }
  | SwitchCostumTo { costume :: CostumeId }
  | NextCostume
  -- Control
  | IfThenElse Condition Statements Statements
  | IfThen     Condition Statements
  | Repeat     Int       Statements
  -- SendEvent
  | Broadcast        Message
  | BroadcastAndWait Message
  -- Custom
  | Custom { blockID :: BlockId }

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
