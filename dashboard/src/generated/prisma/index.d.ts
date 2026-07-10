
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Trade
 * 
 */
export type Trade = $Result.DefaultSelection<Prisma.$TradePayload>
/**
 * Model Position
 * 
 */
export type Position = $Result.DefaultSelection<Prisma.$PositionPayload>
/**
 * Model Signal
 * 
 */
export type Signal = $Result.DefaultSelection<Prisma.$SignalPayload>
/**
 * Model AccountSnapshot
 * 
 */
export type AccountSnapshot = $Result.DefaultSelection<Prisma.$AccountSnapshotPayload>
/**
 * Model RiskSnapshot
 * 
 */
export type RiskSnapshot = $Result.DefaultSelection<Prisma.$RiskSnapshotPayload>
/**
 * Model MarketCandle
 * 
 */
export type MarketCandle = $Result.DefaultSelection<Prisma.$MarketCandlePayload>
/**
 * Model LogEntry
 * 
 */
export type LogEntry = $Result.DefaultSelection<Prisma.$LogEntryPayload>
/**
 * Model JournalEntry
 * 
 */
export type JournalEntry = $Result.DefaultSelection<Prisma.$JournalEntryPayload>
/**
 * Model Notification
 * 
 */
export type Notification = $Result.DefaultSelection<Prisma.$NotificationPayload>
/**
 * Model BotState
 * 
 */
export type BotState = $Result.DefaultSelection<Prisma.$BotStatePayload>
/**
 * Model SessionWindow
 * 
 */
export type SessionWindow = $Result.DefaultSelection<Prisma.$SessionWindowPayload>
/**
 * Model DecisionLog
 * 
 */
export type DecisionLog = $Result.DefaultSelection<Prisma.$DecisionLogPayload>
/**
 * Model PendingOrder
 * 
 */
export type PendingOrder = $Result.DefaultSelection<Prisma.$PendingOrderPayload>
/**
 * Model BotHeartbeat
 * 
 */
export type BotHeartbeat = $Result.DefaultSelection<Prisma.$BotHeartbeatPayload>
/**
 * Model DailyRiskCounter
 * 
 */
export type DailyRiskCounter = $Result.DefaultSelection<Prisma.$DailyRiskCounterPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const TradeSide: {
  BUY: 'BUY',
  SELL: 'SELL'
};

export type TradeSide = (typeof TradeSide)[keyof typeof TradeSide]


export const TradeStatus: {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED'
};

export type TradeStatus = (typeof TradeStatus)[keyof typeof TradeStatus]


export const SignalDirection: {
  BUY: 'BUY',
  SELL: 'SELL',
  NEUTRAL: 'NEUTRAL'
};

export type SignalDirection = (typeof SignalDirection)[keyof typeof SignalDirection]


export const LogLevel: {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL'
};

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel]


export const NotificationStatus: {
  QUEUED: 'QUEUED',
  SENT: 'SENT',
  FAILED: 'FAILED'
};

export type NotificationStatus = (typeof NotificationStatus)[keyof typeof NotificationStatus]


export const BotMode: {
  DISABLED: 'DISABLED',
  OBSERVE: 'OBSERVE',
  SEMI_AUTO: 'SEMI_AUTO',
  FULL_AUTO: 'FULL_AUTO'
};

export type BotMode = (typeof BotMode)[keyof typeof BotMode]


export const DecisionStatus: {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ERROR: 'ERROR',
  EXECUTED: 'EXECUTED'
};

export type DecisionStatus = (typeof DecisionStatus)[keyof typeof DecisionStatus]


export const DecisionAction: {
  OPEN_BUY: 'OPEN_BUY',
  OPEN_SELL: 'OPEN_SELL',
  CLOSE: 'CLOSE',
  HOLD: 'HOLD',
  SKIP: 'SKIP'
};

export type DecisionAction = (typeof DecisionAction)[keyof typeof DecisionAction]


export const PendingOrderType: {
  BUY_LIMIT: 'BUY_LIMIT',
  SELL_LIMIT: 'SELL_LIMIT',
  BUY_STOP: 'BUY_STOP',
  SELL_STOP: 'SELL_STOP'
};

export type PendingOrderType = (typeof PendingOrderType)[keyof typeof PendingOrderType]


export const PendingOrderStatus: {
  PENDING: 'PENDING',
  TRIGGERED: 'TRIGGERED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  REJECTED: 'REJECTED'
};

export type PendingOrderStatus = (typeof PendingOrderStatus)[keyof typeof PendingOrderStatus]

}

export type TradeSide = $Enums.TradeSide

export const TradeSide: typeof $Enums.TradeSide

export type TradeStatus = $Enums.TradeStatus

export const TradeStatus: typeof $Enums.TradeStatus

export type SignalDirection = $Enums.SignalDirection

export const SignalDirection: typeof $Enums.SignalDirection

export type LogLevel = $Enums.LogLevel

export const LogLevel: typeof $Enums.LogLevel

export type NotificationStatus = $Enums.NotificationStatus

export const NotificationStatus: typeof $Enums.NotificationStatus

export type BotMode = $Enums.BotMode

export const BotMode: typeof $Enums.BotMode

export type DecisionStatus = $Enums.DecisionStatus

export const DecisionStatus: typeof $Enums.DecisionStatus

export type DecisionAction = $Enums.DecisionAction

export const DecisionAction: typeof $Enums.DecisionAction

export type PendingOrderType = $Enums.PendingOrderType

export const PendingOrderType: typeof $Enums.PendingOrderType

export type PendingOrderStatus = $Enums.PendingOrderStatus

export const PendingOrderStatus: typeof $Enums.PendingOrderStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Trades
 * const trades = await prisma.trade.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Trades
   * const trades = await prisma.trade.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.trade`: Exposes CRUD operations for the **Trade** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Trades
    * const trades = await prisma.trade.findMany()
    * ```
    */
  get trade(): Prisma.TradeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.position`: Exposes CRUD operations for the **Position** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Positions
    * const positions = await prisma.position.findMany()
    * ```
    */
  get position(): Prisma.PositionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.signal`: Exposes CRUD operations for the **Signal** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Signals
    * const signals = await prisma.signal.findMany()
    * ```
    */
  get signal(): Prisma.SignalDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.accountSnapshot`: Exposes CRUD operations for the **AccountSnapshot** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AccountSnapshots
    * const accountSnapshots = await prisma.accountSnapshot.findMany()
    * ```
    */
  get accountSnapshot(): Prisma.AccountSnapshotDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.riskSnapshot`: Exposes CRUD operations for the **RiskSnapshot** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RiskSnapshots
    * const riskSnapshots = await prisma.riskSnapshot.findMany()
    * ```
    */
  get riskSnapshot(): Prisma.RiskSnapshotDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.marketCandle`: Exposes CRUD operations for the **MarketCandle** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MarketCandles
    * const marketCandles = await prisma.marketCandle.findMany()
    * ```
    */
  get marketCandle(): Prisma.MarketCandleDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.logEntry`: Exposes CRUD operations for the **LogEntry** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LogEntries
    * const logEntries = await prisma.logEntry.findMany()
    * ```
    */
  get logEntry(): Prisma.LogEntryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.journalEntry`: Exposes CRUD operations for the **JournalEntry** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more JournalEntries
    * const journalEntries = await prisma.journalEntry.findMany()
    * ```
    */
  get journalEntry(): Prisma.JournalEntryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.notification`: Exposes CRUD operations for the **Notification** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Notifications
    * const notifications = await prisma.notification.findMany()
    * ```
    */
  get notification(): Prisma.NotificationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.botState`: Exposes CRUD operations for the **BotState** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BotStates
    * const botStates = await prisma.botState.findMany()
    * ```
    */
  get botState(): Prisma.BotStateDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.sessionWindow`: Exposes CRUD operations for the **SessionWindow** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SessionWindows
    * const sessionWindows = await prisma.sessionWindow.findMany()
    * ```
    */
  get sessionWindow(): Prisma.SessionWindowDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.decisionLog`: Exposes CRUD operations for the **DecisionLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DecisionLogs
    * const decisionLogs = await prisma.decisionLog.findMany()
    * ```
    */
  get decisionLog(): Prisma.DecisionLogDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.pendingOrder`: Exposes CRUD operations for the **PendingOrder** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PendingOrders
    * const pendingOrders = await prisma.pendingOrder.findMany()
    * ```
    */
  get pendingOrder(): Prisma.PendingOrderDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.botHeartbeat`: Exposes CRUD operations for the **BotHeartbeat** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BotHeartbeats
    * const botHeartbeats = await prisma.botHeartbeat.findMany()
    * ```
    */
  get botHeartbeat(): Prisma.BotHeartbeatDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.dailyRiskCounter`: Exposes CRUD operations for the **DailyRiskCounter** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DailyRiskCounters
    * const dailyRiskCounters = await prisma.dailyRiskCounter.findMany()
    * ```
    */
  get dailyRiskCounter(): Prisma.DailyRiskCounterDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.8.0
   * Query Engine version: 3c6e192761c0362d496ed980de936e2f3cebcd3a
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Trade: 'Trade',
    Position: 'Position',
    Signal: 'Signal',
    AccountSnapshot: 'AccountSnapshot',
    RiskSnapshot: 'RiskSnapshot',
    MarketCandle: 'MarketCandle',
    LogEntry: 'LogEntry',
    JournalEntry: 'JournalEntry',
    Notification: 'Notification',
    BotState: 'BotState',
    SessionWindow: 'SessionWindow',
    DecisionLog: 'DecisionLog',
    PendingOrder: 'PendingOrder',
    BotHeartbeat: 'BotHeartbeat',
    DailyRiskCounter: 'DailyRiskCounter'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "trade" | "position" | "signal" | "accountSnapshot" | "riskSnapshot" | "marketCandle" | "logEntry" | "journalEntry" | "notification" | "botState" | "sessionWindow" | "decisionLog" | "pendingOrder" | "botHeartbeat" | "dailyRiskCounter"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Trade: {
        payload: Prisma.$TradePayload<ExtArgs>
        fields: Prisma.TradeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TradeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TradeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload>
          }
          findFirst: {
            args: Prisma.TradeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TradeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload>
          }
          findMany: {
            args: Prisma.TradeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload>[]
          }
          create: {
            args: Prisma.TradeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload>
          }
          createMany: {
            args: Prisma.TradeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TradeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload>[]
          }
          delete: {
            args: Prisma.TradeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload>
          }
          update: {
            args: Prisma.TradeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload>
          }
          deleteMany: {
            args: Prisma.TradeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TradeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TradeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload>[]
          }
          upsert: {
            args: Prisma.TradeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TradePayload>
          }
          aggregate: {
            args: Prisma.TradeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTrade>
          }
          groupBy: {
            args: Prisma.TradeGroupByArgs<ExtArgs>
            result: $Utils.Optional<TradeGroupByOutputType>[]
          }
          count: {
            args: Prisma.TradeCountArgs<ExtArgs>
            result: $Utils.Optional<TradeCountAggregateOutputType> | number
          }
        }
      }
      Position: {
        payload: Prisma.$PositionPayload<ExtArgs>
        fields: Prisma.PositionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PositionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PositionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PositionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PositionPayload>
          }
          findFirst: {
            args: Prisma.PositionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PositionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PositionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PositionPayload>
          }
          findMany: {
            args: Prisma.PositionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PositionPayload>[]
          }
          create: {
            args: Prisma.PositionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PositionPayload>
          }
          createMany: {
            args: Prisma.PositionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PositionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PositionPayload>[]
          }
          delete: {
            args: Prisma.PositionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PositionPayload>
          }
          update: {
            args: Prisma.PositionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PositionPayload>
          }
          deleteMany: {
            args: Prisma.PositionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PositionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PositionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PositionPayload>[]
          }
          upsert: {
            args: Prisma.PositionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PositionPayload>
          }
          aggregate: {
            args: Prisma.PositionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePosition>
          }
          groupBy: {
            args: Prisma.PositionGroupByArgs<ExtArgs>
            result: $Utils.Optional<PositionGroupByOutputType>[]
          }
          count: {
            args: Prisma.PositionCountArgs<ExtArgs>
            result: $Utils.Optional<PositionCountAggregateOutputType> | number
          }
        }
      }
      Signal: {
        payload: Prisma.$SignalPayload<ExtArgs>
        fields: Prisma.SignalFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SignalFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SignalFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload>
          }
          findFirst: {
            args: Prisma.SignalFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SignalFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload>
          }
          findMany: {
            args: Prisma.SignalFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload>[]
          }
          create: {
            args: Prisma.SignalCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload>
          }
          createMany: {
            args: Prisma.SignalCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SignalCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload>[]
          }
          delete: {
            args: Prisma.SignalDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload>
          }
          update: {
            args: Prisma.SignalUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload>
          }
          deleteMany: {
            args: Prisma.SignalDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SignalUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SignalUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload>[]
          }
          upsert: {
            args: Prisma.SignalUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignalPayload>
          }
          aggregate: {
            args: Prisma.SignalAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSignal>
          }
          groupBy: {
            args: Prisma.SignalGroupByArgs<ExtArgs>
            result: $Utils.Optional<SignalGroupByOutputType>[]
          }
          count: {
            args: Prisma.SignalCountArgs<ExtArgs>
            result: $Utils.Optional<SignalCountAggregateOutputType> | number
          }
        }
      }
      AccountSnapshot: {
        payload: Prisma.$AccountSnapshotPayload<ExtArgs>
        fields: Prisma.AccountSnapshotFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AccountSnapshotFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountSnapshotPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AccountSnapshotFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountSnapshotPayload>
          }
          findFirst: {
            args: Prisma.AccountSnapshotFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountSnapshotPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AccountSnapshotFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountSnapshotPayload>
          }
          findMany: {
            args: Prisma.AccountSnapshotFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountSnapshotPayload>[]
          }
          create: {
            args: Prisma.AccountSnapshotCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountSnapshotPayload>
          }
          createMany: {
            args: Prisma.AccountSnapshotCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AccountSnapshotCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountSnapshotPayload>[]
          }
          delete: {
            args: Prisma.AccountSnapshotDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountSnapshotPayload>
          }
          update: {
            args: Prisma.AccountSnapshotUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountSnapshotPayload>
          }
          deleteMany: {
            args: Prisma.AccountSnapshotDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AccountSnapshotUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AccountSnapshotUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountSnapshotPayload>[]
          }
          upsert: {
            args: Prisma.AccountSnapshotUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountSnapshotPayload>
          }
          aggregate: {
            args: Prisma.AccountSnapshotAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAccountSnapshot>
          }
          groupBy: {
            args: Prisma.AccountSnapshotGroupByArgs<ExtArgs>
            result: $Utils.Optional<AccountSnapshotGroupByOutputType>[]
          }
          count: {
            args: Prisma.AccountSnapshotCountArgs<ExtArgs>
            result: $Utils.Optional<AccountSnapshotCountAggregateOutputType> | number
          }
        }
      }
      RiskSnapshot: {
        payload: Prisma.$RiskSnapshotPayload<ExtArgs>
        fields: Prisma.RiskSnapshotFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RiskSnapshotFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RiskSnapshotPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RiskSnapshotFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RiskSnapshotPayload>
          }
          findFirst: {
            args: Prisma.RiskSnapshotFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RiskSnapshotPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RiskSnapshotFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RiskSnapshotPayload>
          }
          findMany: {
            args: Prisma.RiskSnapshotFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RiskSnapshotPayload>[]
          }
          create: {
            args: Prisma.RiskSnapshotCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RiskSnapshotPayload>
          }
          createMany: {
            args: Prisma.RiskSnapshotCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RiskSnapshotCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RiskSnapshotPayload>[]
          }
          delete: {
            args: Prisma.RiskSnapshotDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RiskSnapshotPayload>
          }
          update: {
            args: Prisma.RiskSnapshotUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RiskSnapshotPayload>
          }
          deleteMany: {
            args: Prisma.RiskSnapshotDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RiskSnapshotUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RiskSnapshotUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RiskSnapshotPayload>[]
          }
          upsert: {
            args: Prisma.RiskSnapshotUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RiskSnapshotPayload>
          }
          aggregate: {
            args: Prisma.RiskSnapshotAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRiskSnapshot>
          }
          groupBy: {
            args: Prisma.RiskSnapshotGroupByArgs<ExtArgs>
            result: $Utils.Optional<RiskSnapshotGroupByOutputType>[]
          }
          count: {
            args: Prisma.RiskSnapshotCountArgs<ExtArgs>
            result: $Utils.Optional<RiskSnapshotCountAggregateOutputType> | number
          }
        }
      }
      MarketCandle: {
        payload: Prisma.$MarketCandlePayload<ExtArgs>
        fields: Prisma.MarketCandleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MarketCandleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketCandlePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MarketCandleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketCandlePayload>
          }
          findFirst: {
            args: Prisma.MarketCandleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketCandlePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MarketCandleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketCandlePayload>
          }
          findMany: {
            args: Prisma.MarketCandleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketCandlePayload>[]
          }
          create: {
            args: Prisma.MarketCandleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketCandlePayload>
          }
          createMany: {
            args: Prisma.MarketCandleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MarketCandleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketCandlePayload>[]
          }
          delete: {
            args: Prisma.MarketCandleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketCandlePayload>
          }
          update: {
            args: Prisma.MarketCandleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketCandlePayload>
          }
          deleteMany: {
            args: Prisma.MarketCandleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MarketCandleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MarketCandleUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketCandlePayload>[]
          }
          upsert: {
            args: Prisma.MarketCandleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketCandlePayload>
          }
          aggregate: {
            args: Prisma.MarketCandleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMarketCandle>
          }
          groupBy: {
            args: Prisma.MarketCandleGroupByArgs<ExtArgs>
            result: $Utils.Optional<MarketCandleGroupByOutputType>[]
          }
          count: {
            args: Prisma.MarketCandleCountArgs<ExtArgs>
            result: $Utils.Optional<MarketCandleCountAggregateOutputType> | number
          }
        }
      }
      LogEntry: {
        payload: Prisma.$LogEntryPayload<ExtArgs>
        fields: Prisma.LogEntryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LogEntryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LogEntryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LogEntryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LogEntryPayload>
          }
          findFirst: {
            args: Prisma.LogEntryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LogEntryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LogEntryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LogEntryPayload>
          }
          findMany: {
            args: Prisma.LogEntryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LogEntryPayload>[]
          }
          create: {
            args: Prisma.LogEntryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LogEntryPayload>
          }
          createMany: {
            args: Prisma.LogEntryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LogEntryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LogEntryPayload>[]
          }
          delete: {
            args: Prisma.LogEntryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LogEntryPayload>
          }
          update: {
            args: Prisma.LogEntryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LogEntryPayload>
          }
          deleteMany: {
            args: Prisma.LogEntryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LogEntryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LogEntryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LogEntryPayload>[]
          }
          upsert: {
            args: Prisma.LogEntryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LogEntryPayload>
          }
          aggregate: {
            args: Prisma.LogEntryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLogEntry>
          }
          groupBy: {
            args: Prisma.LogEntryGroupByArgs<ExtArgs>
            result: $Utils.Optional<LogEntryGroupByOutputType>[]
          }
          count: {
            args: Prisma.LogEntryCountArgs<ExtArgs>
            result: $Utils.Optional<LogEntryCountAggregateOutputType> | number
          }
        }
      }
      JournalEntry: {
        payload: Prisma.$JournalEntryPayload<ExtArgs>
        fields: Prisma.JournalEntryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.JournalEntryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JournalEntryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.JournalEntryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JournalEntryPayload>
          }
          findFirst: {
            args: Prisma.JournalEntryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JournalEntryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.JournalEntryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JournalEntryPayload>
          }
          findMany: {
            args: Prisma.JournalEntryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JournalEntryPayload>[]
          }
          create: {
            args: Prisma.JournalEntryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JournalEntryPayload>
          }
          createMany: {
            args: Prisma.JournalEntryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.JournalEntryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JournalEntryPayload>[]
          }
          delete: {
            args: Prisma.JournalEntryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JournalEntryPayload>
          }
          update: {
            args: Prisma.JournalEntryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JournalEntryPayload>
          }
          deleteMany: {
            args: Prisma.JournalEntryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.JournalEntryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.JournalEntryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JournalEntryPayload>[]
          }
          upsert: {
            args: Prisma.JournalEntryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JournalEntryPayload>
          }
          aggregate: {
            args: Prisma.JournalEntryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateJournalEntry>
          }
          groupBy: {
            args: Prisma.JournalEntryGroupByArgs<ExtArgs>
            result: $Utils.Optional<JournalEntryGroupByOutputType>[]
          }
          count: {
            args: Prisma.JournalEntryCountArgs<ExtArgs>
            result: $Utils.Optional<JournalEntryCountAggregateOutputType> | number
          }
        }
      }
      Notification: {
        payload: Prisma.$NotificationPayload<ExtArgs>
        fields: Prisma.NotificationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NotificationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NotificationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          findFirst: {
            args: Prisma.NotificationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NotificationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          findMany: {
            args: Prisma.NotificationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>[]
          }
          create: {
            args: Prisma.NotificationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          createMany: {
            args: Prisma.NotificationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.NotificationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>[]
          }
          delete: {
            args: Prisma.NotificationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          update: {
            args: Prisma.NotificationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          deleteMany: {
            args: Prisma.NotificationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NotificationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.NotificationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>[]
          }
          upsert: {
            args: Prisma.NotificationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          aggregate: {
            args: Prisma.NotificationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNotification>
          }
          groupBy: {
            args: Prisma.NotificationGroupByArgs<ExtArgs>
            result: $Utils.Optional<NotificationGroupByOutputType>[]
          }
          count: {
            args: Prisma.NotificationCountArgs<ExtArgs>
            result: $Utils.Optional<NotificationCountAggregateOutputType> | number
          }
        }
      }
      BotState: {
        payload: Prisma.$BotStatePayload<ExtArgs>
        fields: Prisma.BotStateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BotStateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotStatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BotStateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotStatePayload>
          }
          findFirst: {
            args: Prisma.BotStateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotStatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BotStateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotStatePayload>
          }
          findMany: {
            args: Prisma.BotStateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotStatePayload>[]
          }
          create: {
            args: Prisma.BotStateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotStatePayload>
          }
          createMany: {
            args: Prisma.BotStateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BotStateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotStatePayload>[]
          }
          delete: {
            args: Prisma.BotStateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotStatePayload>
          }
          update: {
            args: Prisma.BotStateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotStatePayload>
          }
          deleteMany: {
            args: Prisma.BotStateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BotStateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BotStateUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotStatePayload>[]
          }
          upsert: {
            args: Prisma.BotStateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotStatePayload>
          }
          aggregate: {
            args: Prisma.BotStateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBotState>
          }
          groupBy: {
            args: Prisma.BotStateGroupByArgs<ExtArgs>
            result: $Utils.Optional<BotStateGroupByOutputType>[]
          }
          count: {
            args: Prisma.BotStateCountArgs<ExtArgs>
            result: $Utils.Optional<BotStateCountAggregateOutputType> | number
          }
        }
      }
      SessionWindow: {
        payload: Prisma.$SessionWindowPayload<ExtArgs>
        fields: Prisma.SessionWindowFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SessionWindowFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionWindowPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SessionWindowFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionWindowPayload>
          }
          findFirst: {
            args: Prisma.SessionWindowFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionWindowPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SessionWindowFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionWindowPayload>
          }
          findMany: {
            args: Prisma.SessionWindowFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionWindowPayload>[]
          }
          create: {
            args: Prisma.SessionWindowCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionWindowPayload>
          }
          createMany: {
            args: Prisma.SessionWindowCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SessionWindowCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionWindowPayload>[]
          }
          delete: {
            args: Prisma.SessionWindowDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionWindowPayload>
          }
          update: {
            args: Prisma.SessionWindowUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionWindowPayload>
          }
          deleteMany: {
            args: Prisma.SessionWindowDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SessionWindowUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SessionWindowUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionWindowPayload>[]
          }
          upsert: {
            args: Prisma.SessionWindowUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionWindowPayload>
          }
          aggregate: {
            args: Prisma.SessionWindowAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSessionWindow>
          }
          groupBy: {
            args: Prisma.SessionWindowGroupByArgs<ExtArgs>
            result: $Utils.Optional<SessionWindowGroupByOutputType>[]
          }
          count: {
            args: Prisma.SessionWindowCountArgs<ExtArgs>
            result: $Utils.Optional<SessionWindowCountAggregateOutputType> | number
          }
        }
      }
      DecisionLog: {
        payload: Prisma.$DecisionLogPayload<ExtArgs>
        fields: Prisma.DecisionLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DecisionLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DecisionLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DecisionLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DecisionLogPayload>
          }
          findFirst: {
            args: Prisma.DecisionLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DecisionLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DecisionLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DecisionLogPayload>
          }
          findMany: {
            args: Prisma.DecisionLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DecisionLogPayload>[]
          }
          create: {
            args: Prisma.DecisionLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DecisionLogPayload>
          }
          createMany: {
            args: Prisma.DecisionLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DecisionLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DecisionLogPayload>[]
          }
          delete: {
            args: Prisma.DecisionLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DecisionLogPayload>
          }
          update: {
            args: Prisma.DecisionLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DecisionLogPayload>
          }
          deleteMany: {
            args: Prisma.DecisionLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DecisionLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DecisionLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DecisionLogPayload>[]
          }
          upsert: {
            args: Prisma.DecisionLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DecisionLogPayload>
          }
          aggregate: {
            args: Prisma.DecisionLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDecisionLog>
          }
          groupBy: {
            args: Prisma.DecisionLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<DecisionLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.DecisionLogCountArgs<ExtArgs>
            result: $Utils.Optional<DecisionLogCountAggregateOutputType> | number
          }
        }
      }
      PendingOrder: {
        payload: Prisma.$PendingOrderPayload<ExtArgs>
        fields: Prisma.PendingOrderFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PendingOrderFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingOrderPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PendingOrderFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingOrderPayload>
          }
          findFirst: {
            args: Prisma.PendingOrderFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingOrderPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PendingOrderFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingOrderPayload>
          }
          findMany: {
            args: Prisma.PendingOrderFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingOrderPayload>[]
          }
          create: {
            args: Prisma.PendingOrderCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingOrderPayload>
          }
          createMany: {
            args: Prisma.PendingOrderCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PendingOrderCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingOrderPayload>[]
          }
          delete: {
            args: Prisma.PendingOrderDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingOrderPayload>
          }
          update: {
            args: Prisma.PendingOrderUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingOrderPayload>
          }
          deleteMany: {
            args: Prisma.PendingOrderDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PendingOrderUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PendingOrderUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingOrderPayload>[]
          }
          upsert: {
            args: Prisma.PendingOrderUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PendingOrderPayload>
          }
          aggregate: {
            args: Prisma.PendingOrderAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePendingOrder>
          }
          groupBy: {
            args: Prisma.PendingOrderGroupByArgs<ExtArgs>
            result: $Utils.Optional<PendingOrderGroupByOutputType>[]
          }
          count: {
            args: Prisma.PendingOrderCountArgs<ExtArgs>
            result: $Utils.Optional<PendingOrderCountAggregateOutputType> | number
          }
        }
      }
      BotHeartbeat: {
        payload: Prisma.$BotHeartbeatPayload<ExtArgs>
        fields: Prisma.BotHeartbeatFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BotHeartbeatFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotHeartbeatPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BotHeartbeatFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotHeartbeatPayload>
          }
          findFirst: {
            args: Prisma.BotHeartbeatFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotHeartbeatPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BotHeartbeatFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotHeartbeatPayload>
          }
          findMany: {
            args: Prisma.BotHeartbeatFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotHeartbeatPayload>[]
          }
          create: {
            args: Prisma.BotHeartbeatCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotHeartbeatPayload>
          }
          createMany: {
            args: Prisma.BotHeartbeatCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BotHeartbeatCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotHeartbeatPayload>[]
          }
          delete: {
            args: Prisma.BotHeartbeatDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotHeartbeatPayload>
          }
          update: {
            args: Prisma.BotHeartbeatUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotHeartbeatPayload>
          }
          deleteMany: {
            args: Prisma.BotHeartbeatDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BotHeartbeatUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BotHeartbeatUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotHeartbeatPayload>[]
          }
          upsert: {
            args: Prisma.BotHeartbeatUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BotHeartbeatPayload>
          }
          aggregate: {
            args: Prisma.BotHeartbeatAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBotHeartbeat>
          }
          groupBy: {
            args: Prisma.BotHeartbeatGroupByArgs<ExtArgs>
            result: $Utils.Optional<BotHeartbeatGroupByOutputType>[]
          }
          count: {
            args: Prisma.BotHeartbeatCountArgs<ExtArgs>
            result: $Utils.Optional<BotHeartbeatCountAggregateOutputType> | number
          }
        }
      }
      DailyRiskCounter: {
        payload: Prisma.$DailyRiskCounterPayload<ExtArgs>
        fields: Prisma.DailyRiskCounterFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DailyRiskCounterFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyRiskCounterPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DailyRiskCounterFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyRiskCounterPayload>
          }
          findFirst: {
            args: Prisma.DailyRiskCounterFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyRiskCounterPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DailyRiskCounterFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyRiskCounterPayload>
          }
          findMany: {
            args: Prisma.DailyRiskCounterFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyRiskCounterPayload>[]
          }
          create: {
            args: Prisma.DailyRiskCounterCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyRiskCounterPayload>
          }
          createMany: {
            args: Prisma.DailyRiskCounterCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DailyRiskCounterCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyRiskCounterPayload>[]
          }
          delete: {
            args: Prisma.DailyRiskCounterDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyRiskCounterPayload>
          }
          update: {
            args: Prisma.DailyRiskCounterUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyRiskCounterPayload>
          }
          deleteMany: {
            args: Prisma.DailyRiskCounterDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DailyRiskCounterUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DailyRiskCounterUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyRiskCounterPayload>[]
          }
          upsert: {
            args: Prisma.DailyRiskCounterUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DailyRiskCounterPayload>
          }
          aggregate: {
            args: Prisma.DailyRiskCounterAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDailyRiskCounter>
          }
          groupBy: {
            args: Prisma.DailyRiskCounterGroupByArgs<ExtArgs>
            result: $Utils.Optional<DailyRiskCounterGroupByOutputType>[]
          }
          count: {
            args: Prisma.DailyRiskCounterCountArgs<ExtArgs>
            result: $Utils.Optional<DailyRiskCounterCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    trade?: TradeOmit
    position?: PositionOmit
    signal?: SignalOmit
    accountSnapshot?: AccountSnapshotOmit
    riskSnapshot?: RiskSnapshotOmit
    marketCandle?: MarketCandleOmit
    logEntry?: LogEntryOmit
    journalEntry?: JournalEntryOmit
    notification?: NotificationOmit
    botState?: BotStateOmit
    sessionWindow?: SessionWindowOmit
    decisionLog?: DecisionLogOmit
    pendingOrder?: PendingOrderOmit
    botHeartbeat?: BotHeartbeatOmit
    dailyRiskCounter?: DailyRiskCounterOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type TradeCountOutputType
   */

  export type TradeCountOutputType = {
    decisions: number
  }

  export type TradeCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    decisions?: boolean | TradeCountOutputTypeCountDecisionsArgs
  }

  // Custom InputTypes
  /**
   * TradeCountOutputType without action
   */
  export type TradeCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TradeCountOutputType
     */
    select?: TradeCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TradeCountOutputType without action
   */
  export type TradeCountOutputTypeCountDecisionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DecisionLogWhereInput
  }


  /**
   * Count Type SignalCountOutputType
   */

  export type SignalCountOutputType = {
    decisions: number
  }

  export type SignalCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    decisions?: boolean | SignalCountOutputTypeCountDecisionsArgs
  }

  // Custom InputTypes
  /**
   * SignalCountOutputType without action
   */
  export type SignalCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignalCountOutputType
     */
    select?: SignalCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SignalCountOutputType without action
   */
  export type SignalCountOutputTypeCountDecisionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DecisionLogWhereInput
  }


  /**
   * Count Type SessionWindowCountOutputType
   */

  export type SessionWindowCountOutputType = {
    decisions: number
  }

  export type SessionWindowCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    decisions?: boolean | SessionWindowCountOutputTypeCountDecisionsArgs
  }

  // Custom InputTypes
  /**
   * SessionWindowCountOutputType without action
   */
  export type SessionWindowCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SessionWindowCountOutputType
     */
    select?: SessionWindowCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SessionWindowCountOutputType without action
   */
  export type SessionWindowCountOutputTypeCountDecisionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DecisionLogWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Trade
   */

  export type AggregateTrade = {
    _count: TradeCountAggregateOutputType | null
    _avg: TradeAvgAggregateOutputType | null
    _sum: TradeSumAggregateOutputType | null
    _min: TradeMinAggregateOutputType | null
    _max: TradeMaxAggregateOutputType | null
  }

  export type TradeAvgAggregateOutputType = {
    ticket: number | null
    volume: number | null
    openPrice: number | null
    closePrice: number | null
    stopLoss: number | null
    takeProfit: number | null
    commission: number | null
    swap: number | null
    grossProfit: number | null
    netProfit: number | null
    pips: number | null
    magic: number | null
  }

  export type TradeSumAggregateOutputType = {
    ticket: bigint | null
    volume: number | null
    openPrice: number | null
    closePrice: number | null
    stopLoss: number | null
    takeProfit: number | null
    commission: number | null
    swap: number | null
    grossProfit: number | null
    netProfit: number | null
    pips: number | null
    magic: number | null
  }

  export type TradeMinAggregateOutputType = {
    id: string | null
    ticket: bigint | null
    symbol: string | null
    side: $Enums.TradeSide | null
    volume: number | null
    openPrice: number | null
    closePrice: number | null
    stopLoss: number | null
    takeProfit: number | null
    commission: number | null
    swap: number | null
    grossProfit: number | null
    netProfit: number | null
    pips: number | null
    strategy: string | null
    magic: number | null
    comment: string | null
    status: $Enums.TradeStatus | null
    openedAt: Date | null
    closedAt: Date | null
    createdAt: Date | null
  }

  export type TradeMaxAggregateOutputType = {
    id: string | null
    ticket: bigint | null
    symbol: string | null
    side: $Enums.TradeSide | null
    volume: number | null
    openPrice: number | null
    closePrice: number | null
    stopLoss: number | null
    takeProfit: number | null
    commission: number | null
    swap: number | null
    grossProfit: number | null
    netProfit: number | null
    pips: number | null
    strategy: string | null
    magic: number | null
    comment: string | null
    status: $Enums.TradeStatus | null
    openedAt: Date | null
    closedAt: Date | null
    createdAt: Date | null
  }

  export type TradeCountAggregateOutputType = {
    id: number
    ticket: number
    symbol: number
    side: number
    volume: number
    openPrice: number
    closePrice: number
    stopLoss: number
    takeProfit: number
    commission: number
    swap: number
    grossProfit: number
    netProfit: number
    pips: number
    strategy: number
    magic: number
    comment: number
    status: number
    openedAt: number
    closedAt: number
    createdAt: number
    _all: number
  }


  export type TradeAvgAggregateInputType = {
    ticket?: true
    volume?: true
    openPrice?: true
    closePrice?: true
    stopLoss?: true
    takeProfit?: true
    commission?: true
    swap?: true
    grossProfit?: true
    netProfit?: true
    pips?: true
    magic?: true
  }

  export type TradeSumAggregateInputType = {
    ticket?: true
    volume?: true
    openPrice?: true
    closePrice?: true
    stopLoss?: true
    takeProfit?: true
    commission?: true
    swap?: true
    grossProfit?: true
    netProfit?: true
    pips?: true
    magic?: true
  }

  export type TradeMinAggregateInputType = {
    id?: true
    ticket?: true
    symbol?: true
    side?: true
    volume?: true
    openPrice?: true
    closePrice?: true
    stopLoss?: true
    takeProfit?: true
    commission?: true
    swap?: true
    grossProfit?: true
    netProfit?: true
    pips?: true
    strategy?: true
    magic?: true
    comment?: true
    status?: true
    openedAt?: true
    closedAt?: true
    createdAt?: true
  }

  export type TradeMaxAggregateInputType = {
    id?: true
    ticket?: true
    symbol?: true
    side?: true
    volume?: true
    openPrice?: true
    closePrice?: true
    stopLoss?: true
    takeProfit?: true
    commission?: true
    swap?: true
    grossProfit?: true
    netProfit?: true
    pips?: true
    strategy?: true
    magic?: true
    comment?: true
    status?: true
    openedAt?: true
    closedAt?: true
    createdAt?: true
  }

  export type TradeCountAggregateInputType = {
    id?: true
    ticket?: true
    symbol?: true
    side?: true
    volume?: true
    openPrice?: true
    closePrice?: true
    stopLoss?: true
    takeProfit?: true
    commission?: true
    swap?: true
    grossProfit?: true
    netProfit?: true
    pips?: true
    strategy?: true
    magic?: true
    comment?: true
    status?: true
    openedAt?: true
    closedAt?: true
    createdAt?: true
    _all?: true
  }

  export type TradeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Trade to aggregate.
     */
    where?: TradeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Trades to fetch.
     */
    orderBy?: TradeOrderByWithRelationInput | TradeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TradeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Trades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Trades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Trades
    **/
    _count?: true | TradeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TradeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TradeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TradeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TradeMaxAggregateInputType
  }

  export type GetTradeAggregateType<T extends TradeAggregateArgs> = {
        [P in keyof T & keyof AggregateTrade]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTrade[P]>
      : GetScalarType<T[P], AggregateTrade[P]>
  }




  export type TradeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TradeWhereInput
    orderBy?: TradeOrderByWithAggregationInput | TradeOrderByWithAggregationInput[]
    by: TradeScalarFieldEnum[] | TradeScalarFieldEnum
    having?: TradeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TradeCountAggregateInputType | true
    _avg?: TradeAvgAggregateInputType
    _sum?: TradeSumAggregateInputType
    _min?: TradeMinAggregateInputType
    _max?: TradeMaxAggregateInputType
  }

  export type TradeGroupByOutputType = {
    id: string
    ticket: bigint
    symbol: string
    side: $Enums.TradeSide
    volume: number
    openPrice: number
    closePrice: number | null
    stopLoss: number | null
    takeProfit: number | null
    commission: number
    swap: number
    grossProfit: number
    netProfit: number
    pips: number | null
    strategy: string | null
    magic: number | null
    comment: string | null
    status: $Enums.TradeStatus
    openedAt: Date
    closedAt: Date | null
    createdAt: Date
    _count: TradeCountAggregateOutputType | null
    _avg: TradeAvgAggregateOutputType | null
    _sum: TradeSumAggregateOutputType | null
    _min: TradeMinAggregateOutputType | null
    _max: TradeMaxAggregateOutputType | null
  }

  type GetTradeGroupByPayload<T extends TradeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TradeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TradeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TradeGroupByOutputType[P]>
            : GetScalarType<T[P], TradeGroupByOutputType[P]>
        }
      >
    >


  export type TradeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ticket?: boolean
    symbol?: boolean
    side?: boolean
    volume?: boolean
    openPrice?: boolean
    closePrice?: boolean
    stopLoss?: boolean
    takeProfit?: boolean
    commission?: boolean
    swap?: boolean
    grossProfit?: boolean
    netProfit?: boolean
    pips?: boolean
    strategy?: boolean
    magic?: boolean
    comment?: boolean
    status?: boolean
    openedAt?: boolean
    closedAt?: boolean
    createdAt?: boolean
    decisions?: boolean | Trade$decisionsArgs<ExtArgs>
    _count?: boolean | TradeCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trade"]>

  export type TradeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ticket?: boolean
    symbol?: boolean
    side?: boolean
    volume?: boolean
    openPrice?: boolean
    closePrice?: boolean
    stopLoss?: boolean
    takeProfit?: boolean
    commission?: boolean
    swap?: boolean
    grossProfit?: boolean
    netProfit?: boolean
    pips?: boolean
    strategy?: boolean
    magic?: boolean
    comment?: boolean
    status?: boolean
    openedAt?: boolean
    closedAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["trade"]>

  export type TradeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ticket?: boolean
    symbol?: boolean
    side?: boolean
    volume?: boolean
    openPrice?: boolean
    closePrice?: boolean
    stopLoss?: boolean
    takeProfit?: boolean
    commission?: boolean
    swap?: boolean
    grossProfit?: boolean
    netProfit?: boolean
    pips?: boolean
    strategy?: boolean
    magic?: boolean
    comment?: boolean
    status?: boolean
    openedAt?: boolean
    closedAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["trade"]>

  export type TradeSelectScalar = {
    id?: boolean
    ticket?: boolean
    symbol?: boolean
    side?: boolean
    volume?: boolean
    openPrice?: boolean
    closePrice?: boolean
    stopLoss?: boolean
    takeProfit?: boolean
    commission?: boolean
    swap?: boolean
    grossProfit?: boolean
    netProfit?: boolean
    pips?: boolean
    strategy?: boolean
    magic?: boolean
    comment?: boolean
    status?: boolean
    openedAt?: boolean
    closedAt?: boolean
    createdAt?: boolean
  }

  export type TradeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "ticket" | "symbol" | "side" | "volume" | "openPrice" | "closePrice" | "stopLoss" | "takeProfit" | "commission" | "swap" | "grossProfit" | "netProfit" | "pips" | "strategy" | "magic" | "comment" | "status" | "openedAt" | "closedAt" | "createdAt", ExtArgs["result"]["trade"]>
  export type TradeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    decisions?: boolean | Trade$decisionsArgs<ExtArgs>
    _count?: boolean | TradeCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TradeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type TradeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TradePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Trade"
    objects: {
      decisions: Prisma.$DecisionLogPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      ticket: bigint
      symbol: string
      side: $Enums.TradeSide
      volume: number
      openPrice: number
      closePrice: number | null
      stopLoss: number | null
      takeProfit: number | null
      commission: number
      swap: number
      grossProfit: number
      netProfit: number
      pips: number | null
      strategy: string | null
      magic: number | null
      comment: string | null
      status: $Enums.TradeStatus
      openedAt: Date
      closedAt: Date | null
      createdAt: Date
    }, ExtArgs["result"]["trade"]>
    composites: {}
  }

  type TradeGetPayload<S extends boolean | null | undefined | TradeDefaultArgs> = $Result.GetResult<Prisma.$TradePayload, S>

  type TradeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TradeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TradeCountAggregateInputType | true
    }

  export interface TradeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Trade'], meta: { name: 'Trade' } }
    /**
     * Find zero or one Trade that matches the filter.
     * @param {TradeFindUniqueArgs} args - Arguments to find a Trade
     * @example
     * // Get one Trade
     * const trade = await prisma.trade.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TradeFindUniqueArgs>(args: SelectSubset<T, TradeFindUniqueArgs<ExtArgs>>): Prisma__TradeClient<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Trade that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TradeFindUniqueOrThrowArgs} args - Arguments to find a Trade
     * @example
     * // Get one Trade
     * const trade = await prisma.trade.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TradeFindUniqueOrThrowArgs>(args: SelectSubset<T, TradeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TradeClient<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Trade that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradeFindFirstArgs} args - Arguments to find a Trade
     * @example
     * // Get one Trade
     * const trade = await prisma.trade.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TradeFindFirstArgs>(args?: SelectSubset<T, TradeFindFirstArgs<ExtArgs>>): Prisma__TradeClient<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Trade that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradeFindFirstOrThrowArgs} args - Arguments to find a Trade
     * @example
     * // Get one Trade
     * const trade = await prisma.trade.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TradeFindFirstOrThrowArgs>(args?: SelectSubset<T, TradeFindFirstOrThrowArgs<ExtArgs>>): Prisma__TradeClient<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Trades that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Trades
     * const trades = await prisma.trade.findMany()
     * 
     * // Get first 10 Trades
     * const trades = await prisma.trade.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tradeWithIdOnly = await prisma.trade.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TradeFindManyArgs>(args?: SelectSubset<T, TradeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Trade.
     * @param {TradeCreateArgs} args - Arguments to create a Trade.
     * @example
     * // Create one Trade
     * const Trade = await prisma.trade.create({
     *   data: {
     *     // ... data to create a Trade
     *   }
     * })
     * 
     */
    create<T extends TradeCreateArgs>(args: SelectSubset<T, TradeCreateArgs<ExtArgs>>): Prisma__TradeClient<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Trades.
     * @param {TradeCreateManyArgs} args - Arguments to create many Trades.
     * @example
     * // Create many Trades
     * const trade = await prisma.trade.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TradeCreateManyArgs>(args?: SelectSubset<T, TradeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Trades and returns the data saved in the database.
     * @param {TradeCreateManyAndReturnArgs} args - Arguments to create many Trades.
     * @example
     * // Create many Trades
     * const trade = await prisma.trade.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Trades and only return the `id`
     * const tradeWithIdOnly = await prisma.trade.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TradeCreateManyAndReturnArgs>(args?: SelectSubset<T, TradeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Trade.
     * @param {TradeDeleteArgs} args - Arguments to delete one Trade.
     * @example
     * // Delete one Trade
     * const Trade = await prisma.trade.delete({
     *   where: {
     *     // ... filter to delete one Trade
     *   }
     * })
     * 
     */
    delete<T extends TradeDeleteArgs>(args: SelectSubset<T, TradeDeleteArgs<ExtArgs>>): Prisma__TradeClient<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Trade.
     * @param {TradeUpdateArgs} args - Arguments to update one Trade.
     * @example
     * // Update one Trade
     * const trade = await prisma.trade.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TradeUpdateArgs>(args: SelectSubset<T, TradeUpdateArgs<ExtArgs>>): Prisma__TradeClient<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Trades.
     * @param {TradeDeleteManyArgs} args - Arguments to filter Trades to delete.
     * @example
     * // Delete a few Trades
     * const { count } = await prisma.trade.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TradeDeleteManyArgs>(args?: SelectSubset<T, TradeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Trades.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Trades
     * const trade = await prisma.trade.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TradeUpdateManyArgs>(args: SelectSubset<T, TradeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Trades and returns the data updated in the database.
     * @param {TradeUpdateManyAndReturnArgs} args - Arguments to update many Trades.
     * @example
     * // Update many Trades
     * const trade = await prisma.trade.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Trades and only return the `id`
     * const tradeWithIdOnly = await prisma.trade.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TradeUpdateManyAndReturnArgs>(args: SelectSubset<T, TradeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Trade.
     * @param {TradeUpsertArgs} args - Arguments to update or create a Trade.
     * @example
     * // Update or create a Trade
     * const trade = await prisma.trade.upsert({
     *   create: {
     *     // ... data to create a Trade
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Trade we want to update
     *   }
     * })
     */
    upsert<T extends TradeUpsertArgs>(args: SelectSubset<T, TradeUpsertArgs<ExtArgs>>): Prisma__TradeClient<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Trades.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradeCountArgs} args - Arguments to filter Trades to count.
     * @example
     * // Count the number of Trades
     * const count = await prisma.trade.count({
     *   where: {
     *     // ... the filter for the Trades we want to count
     *   }
     * })
    **/
    count<T extends TradeCountArgs>(
      args?: Subset<T, TradeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TradeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Trade.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TradeAggregateArgs>(args: Subset<T, TradeAggregateArgs>): Prisma.PrismaPromise<GetTradeAggregateType<T>>

    /**
     * Group by Trade.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TradeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TradeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TradeGroupByArgs['orderBy'] }
        : { orderBy?: TradeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TradeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTradeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Trade model
   */
  readonly fields: TradeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Trade.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TradeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    decisions<T extends Trade$decisionsArgs<ExtArgs> = {}>(args?: Subset<T, Trade$decisionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DecisionLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Trade model
   */
  interface TradeFieldRefs {
    readonly id: FieldRef<"Trade", 'String'>
    readonly ticket: FieldRef<"Trade", 'BigInt'>
    readonly symbol: FieldRef<"Trade", 'String'>
    readonly side: FieldRef<"Trade", 'TradeSide'>
    readonly volume: FieldRef<"Trade", 'Float'>
    readonly openPrice: FieldRef<"Trade", 'Float'>
    readonly closePrice: FieldRef<"Trade", 'Float'>
    readonly stopLoss: FieldRef<"Trade", 'Float'>
    readonly takeProfit: FieldRef<"Trade", 'Float'>
    readonly commission: FieldRef<"Trade", 'Float'>
    readonly swap: FieldRef<"Trade", 'Float'>
    readonly grossProfit: FieldRef<"Trade", 'Float'>
    readonly netProfit: FieldRef<"Trade", 'Float'>
    readonly pips: FieldRef<"Trade", 'Float'>
    readonly strategy: FieldRef<"Trade", 'String'>
    readonly magic: FieldRef<"Trade", 'Int'>
    readonly comment: FieldRef<"Trade", 'String'>
    readonly status: FieldRef<"Trade", 'TradeStatus'>
    readonly openedAt: FieldRef<"Trade", 'DateTime'>
    readonly closedAt: FieldRef<"Trade", 'DateTime'>
    readonly createdAt: FieldRef<"Trade", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Trade findUnique
   */
  export type TradeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    /**
     * Filter, which Trade to fetch.
     */
    where: TradeWhereUniqueInput
  }

  /**
   * Trade findUniqueOrThrow
   */
  export type TradeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    /**
     * Filter, which Trade to fetch.
     */
    where: TradeWhereUniqueInput
  }

  /**
   * Trade findFirst
   */
  export type TradeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    /**
     * Filter, which Trade to fetch.
     */
    where?: TradeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Trades to fetch.
     */
    orderBy?: TradeOrderByWithRelationInput | TradeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Trades.
     */
    cursor?: TradeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Trades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Trades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Trades.
     */
    distinct?: TradeScalarFieldEnum | TradeScalarFieldEnum[]
  }

  /**
   * Trade findFirstOrThrow
   */
  export type TradeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    /**
     * Filter, which Trade to fetch.
     */
    where?: TradeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Trades to fetch.
     */
    orderBy?: TradeOrderByWithRelationInput | TradeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Trades.
     */
    cursor?: TradeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Trades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Trades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Trades.
     */
    distinct?: TradeScalarFieldEnum | TradeScalarFieldEnum[]
  }

  /**
   * Trade findMany
   */
  export type TradeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    /**
     * Filter, which Trades to fetch.
     */
    where?: TradeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Trades to fetch.
     */
    orderBy?: TradeOrderByWithRelationInput | TradeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Trades.
     */
    cursor?: TradeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Trades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Trades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Trades.
     */
    distinct?: TradeScalarFieldEnum | TradeScalarFieldEnum[]
  }

  /**
   * Trade create
   */
  export type TradeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    /**
     * The data needed to create a Trade.
     */
    data: XOR<TradeCreateInput, TradeUncheckedCreateInput>
  }

  /**
   * Trade createMany
   */
  export type TradeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Trades.
     */
    data: TradeCreateManyInput | TradeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Trade createManyAndReturn
   */
  export type TradeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * The data used to create many Trades.
     */
    data: TradeCreateManyInput | TradeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Trade update
   */
  export type TradeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    /**
     * The data needed to update a Trade.
     */
    data: XOR<TradeUpdateInput, TradeUncheckedUpdateInput>
    /**
     * Choose, which Trade to update.
     */
    where: TradeWhereUniqueInput
  }

  /**
   * Trade updateMany
   */
  export type TradeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Trades.
     */
    data: XOR<TradeUpdateManyMutationInput, TradeUncheckedUpdateManyInput>
    /**
     * Filter which Trades to update
     */
    where?: TradeWhereInput
    /**
     * Limit how many Trades to update.
     */
    limit?: number
  }

  /**
   * Trade updateManyAndReturn
   */
  export type TradeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * The data used to update Trades.
     */
    data: XOR<TradeUpdateManyMutationInput, TradeUncheckedUpdateManyInput>
    /**
     * Filter which Trades to update
     */
    where?: TradeWhereInput
    /**
     * Limit how many Trades to update.
     */
    limit?: number
  }

  /**
   * Trade upsert
   */
  export type TradeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    /**
     * The filter to search for the Trade to update in case it exists.
     */
    where: TradeWhereUniqueInput
    /**
     * In case the Trade found by the `where` argument doesn't exist, create a new Trade with this data.
     */
    create: XOR<TradeCreateInput, TradeUncheckedCreateInput>
    /**
     * In case the Trade was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TradeUpdateInput, TradeUncheckedUpdateInput>
  }

  /**
   * Trade delete
   */
  export type TradeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    /**
     * Filter which Trade to delete.
     */
    where: TradeWhereUniqueInput
  }

  /**
   * Trade deleteMany
   */
  export type TradeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Trades to delete
     */
    where?: TradeWhereInput
    /**
     * Limit how many Trades to delete.
     */
    limit?: number
  }

  /**
   * Trade.decisions
   */
  export type Trade$decisionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionLog
     */
    select?: DecisionLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DecisionLog
     */
    omit?: DecisionLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DecisionLogInclude<ExtArgs> | null
    where?: DecisionLogWhereInput
    orderBy?: DecisionLogOrderByWithRelationInput | DecisionLogOrderByWithRelationInput[]
    cursor?: DecisionLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DecisionLogScalarFieldEnum | DecisionLogScalarFieldEnum[]
  }

  /**
   * Trade without action
   */
  export type TradeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
  }


  /**
   * Model Position
   */

  export type AggregatePosition = {
    _count: PositionCountAggregateOutputType | null
    _avg: PositionAvgAggregateOutputType | null
    _sum: PositionSumAggregateOutputType | null
    _min: PositionMinAggregateOutputType | null
    _max: PositionMaxAggregateOutputType | null
  }

  export type PositionAvgAggregateOutputType = {
    ticket: number | null
    volume: number | null
    openPrice: number | null
    currentPrice: number | null
    stopLoss: number | null
    takeProfit: number | null
    swap: number | null
    commission: number | null
    unrealizedProfit: number | null
  }

  export type PositionSumAggregateOutputType = {
    ticket: bigint | null
    volume: number | null
    openPrice: number | null
    currentPrice: number | null
    stopLoss: number | null
    takeProfit: number | null
    swap: number | null
    commission: number | null
    unrealizedProfit: number | null
  }

  export type PositionMinAggregateOutputType = {
    id: string | null
    ticket: bigint | null
    symbol: string | null
    side: $Enums.TradeSide | null
    volume: number | null
    openPrice: number | null
    currentPrice: number | null
    stopLoss: number | null
    takeProfit: number | null
    swap: number | null
    commission: number | null
    unrealizedProfit: number | null
    openedAt: Date | null
    updatedAt: Date | null
  }

  export type PositionMaxAggregateOutputType = {
    id: string | null
    ticket: bigint | null
    symbol: string | null
    side: $Enums.TradeSide | null
    volume: number | null
    openPrice: number | null
    currentPrice: number | null
    stopLoss: number | null
    takeProfit: number | null
    swap: number | null
    commission: number | null
    unrealizedProfit: number | null
    openedAt: Date | null
    updatedAt: Date | null
  }

  export type PositionCountAggregateOutputType = {
    id: number
    ticket: number
    symbol: number
    side: number
    volume: number
    openPrice: number
    currentPrice: number
    stopLoss: number
    takeProfit: number
    swap: number
    commission: number
    unrealizedProfit: number
    openedAt: number
    updatedAt: number
    _all: number
  }


  export type PositionAvgAggregateInputType = {
    ticket?: true
    volume?: true
    openPrice?: true
    currentPrice?: true
    stopLoss?: true
    takeProfit?: true
    swap?: true
    commission?: true
    unrealizedProfit?: true
  }

  export type PositionSumAggregateInputType = {
    ticket?: true
    volume?: true
    openPrice?: true
    currentPrice?: true
    stopLoss?: true
    takeProfit?: true
    swap?: true
    commission?: true
    unrealizedProfit?: true
  }

  export type PositionMinAggregateInputType = {
    id?: true
    ticket?: true
    symbol?: true
    side?: true
    volume?: true
    openPrice?: true
    currentPrice?: true
    stopLoss?: true
    takeProfit?: true
    swap?: true
    commission?: true
    unrealizedProfit?: true
    openedAt?: true
    updatedAt?: true
  }

  export type PositionMaxAggregateInputType = {
    id?: true
    ticket?: true
    symbol?: true
    side?: true
    volume?: true
    openPrice?: true
    currentPrice?: true
    stopLoss?: true
    takeProfit?: true
    swap?: true
    commission?: true
    unrealizedProfit?: true
    openedAt?: true
    updatedAt?: true
  }

  export type PositionCountAggregateInputType = {
    id?: true
    ticket?: true
    symbol?: true
    side?: true
    volume?: true
    openPrice?: true
    currentPrice?: true
    stopLoss?: true
    takeProfit?: true
    swap?: true
    commission?: true
    unrealizedProfit?: true
    openedAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PositionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Position to aggregate.
     */
    where?: PositionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Positions to fetch.
     */
    orderBy?: PositionOrderByWithRelationInput | PositionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PositionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Positions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Positions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Positions
    **/
    _count?: true | PositionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PositionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PositionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PositionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PositionMaxAggregateInputType
  }

  export type GetPositionAggregateType<T extends PositionAggregateArgs> = {
        [P in keyof T & keyof AggregatePosition]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePosition[P]>
      : GetScalarType<T[P], AggregatePosition[P]>
  }




  export type PositionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PositionWhereInput
    orderBy?: PositionOrderByWithAggregationInput | PositionOrderByWithAggregationInput[]
    by: PositionScalarFieldEnum[] | PositionScalarFieldEnum
    having?: PositionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PositionCountAggregateInputType | true
    _avg?: PositionAvgAggregateInputType
    _sum?: PositionSumAggregateInputType
    _min?: PositionMinAggregateInputType
    _max?: PositionMaxAggregateInputType
  }

  export type PositionGroupByOutputType = {
    id: string
    ticket: bigint
    symbol: string
    side: $Enums.TradeSide
    volume: number
    openPrice: number
    currentPrice: number
    stopLoss: number | null
    takeProfit: number | null
    swap: number
    commission: number
    unrealizedProfit: number
    openedAt: Date
    updatedAt: Date
    _count: PositionCountAggregateOutputType | null
    _avg: PositionAvgAggregateOutputType | null
    _sum: PositionSumAggregateOutputType | null
    _min: PositionMinAggregateOutputType | null
    _max: PositionMaxAggregateOutputType | null
  }

  type GetPositionGroupByPayload<T extends PositionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PositionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PositionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PositionGroupByOutputType[P]>
            : GetScalarType<T[P], PositionGroupByOutputType[P]>
        }
      >
    >


  export type PositionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ticket?: boolean
    symbol?: boolean
    side?: boolean
    volume?: boolean
    openPrice?: boolean
    currentPrice?: boolean
    stopLoss?: boolean
    takeProfit?: boolean
    swap?: boolean
    commission?: boolean
    unrealizedProfit?: boolean
    openedAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["position"]>

  export type PositionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ticket?: boolean
    symbol?: boolean
    side?: boolean
    volume?: boolean
    openPrice?: boolean
    currentPrice?: boolean
    stopLoss?: boolean
    takeProfit?: boolean
    swap?: boolean
    commission?: boolean
    unrealizedProfit?: boolean
    openedAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["position"]>

  export type PositionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ticket?: boolean
    symbol?: boolean
    side?: boolean
    volume?: boolean
    openPrice?: boolean
    currentPrice?: boolean
    stopLoss?: boolean
    takeProfit?: boolean
    swap?: boolean
    commission?: boolean
    unrealizedProfit?: boolean
    openedAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["position"]>

  export type PositionSelectScalar = {
    id?: boolean
    ticket?: boolean
    symbol?: boolean
    side?: boolean
    volume?: boolean
    openPrice?: boolean
    currentPrice?: boolean
    stopLoss?: boolean
    takeProfit?: boolean
    swap?: boolean
    commission?: boolean
    unrealizedProfit?: boolean
    openedAt?: boolean
    updatedAt?: boolean
  }

  export type PositionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "ticket" | "symbol" | "side" | "volume" | "openPrice" | "currentPrice" | "stopLoss" | "takeProfit" | "swap" | "commission" | "unrealizedProfit" | "openedAt" | "updatedAt", ExtArgs["result"]["position"]>

  export type $PositionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Position"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      ticket: bigint
      symbol: string
      side: $Enums.TradeSide
      volume: number
      openPrice: number
      currentPrice: number
      stopLoss: number | null
      takeProfit: number | null
      swap: number
      commission: number
      unrealizedProfit: number
      openedAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["position"]>
    composites: {}
  }

  type PositionGetPayload<S extends boolean | null | undefined | PositionDefaultArgs> = $Result.GetResult<Prisma.$PositionPayload, S>

  type PositionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PositionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PositionCountAggregateInputType | true
    }

  export interface PositionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Position'], meta: { name: 'Position' } }
    /**
     * Find zero or one Position that matches the filter.
     * @param {PositionFindUniqueArgs} args - Arguments to find a Position
     * @example
     * // Get one Position
     * const position = await prisma.position.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PositionFindUniqueArgs>(args: SelectSubset<T, PositionFindUniqueArgs<ExtArgs>>): Prisma__PositionClient<$Result.GetResult<Prisma.$PositionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Position that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PositionFindUniqueOrThrowArgs} args - Arguments to find a Position
     * @example
     * // Get one Position
     * const position = await prisma.position.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PositionFindUniqueOrThrowArgs>(args: SelectSubset<T, PositionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PositionClient<$Result.GetResult<Prisma.$PositionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Position that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PositionFindFirstArgs} args - Arguments to find a Position
     * @example
     * // Get one Position
     * const position = await prisma.position.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PositionFindFirstArgs>(args?: SelectSubset<T, PositionFindFirstArgs<ExtArgs>>): Prisma__PositionClient<$Result.GetResult<Prisma.$PositionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Position that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PositionFindFirstOrThrowArgs} args - Arguments to find a Position
     * @example
     * // Get one Position
     * const position = await prisma.position.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PositionFindFirstOrThrowArgs>(args?: SelectSubset<T, PositionFindFirstOrThrowArgs<ExtArgs>>): Prisma__PositionClient<$Result.GetResult<Prisma.$PositionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Positions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PositionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Positions
     * const positions = await prisma.position.findMany()
     * 
     * // Get first 10 Positions
     * const positions = await prisma.position.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const positionWithIdOnly = await prisma.position.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PositionFindManyArgs>(args?: SelectSubset<T, PositionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PositionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Position.
     * @param {PositionCreateArgs} args - Arguments to create a Position.
     * @example
     * // Create one Position
     * const Position = await prisma.position.create({
     *   data: {
     *     // ... data to create a Position
     *   }
     * })
     * 
     */
    create<T extends PositionCreateArgs>(args: SelectSubset<T, PositionCreateArgs<ExtArgs>>): Prisma__PositionClient<$Result.GetResult<Prisma.$PositionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Positions.
     * @param {PositionCreateManyArgs} args - Arguments to create many Positions.
     * @example
     * // Create many Positions
     * const position = await prisma.position.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PositionCreateManyArgs>(args?: SelectSubset<T, PositionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Positions and returns the data saved in the database.
     * @param {PositionCreateManyAndReturnArgs} args - Arguments to create many Positions.
     * @example
     * // Create many Positions
     * const position = await prisma.position.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Positions and only return the `id`
     * const positionWithIdOnly = await prisma.position.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PositionCreateManyAndReturnArgs>(args?: SelectSubset<T, PositionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PositionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Position.
     * @param {PositionDeleteArgs} args - Arguments to delete one Position.
     * @example
     * // Delete one Position
     * const Position = await prisma.position.delete({
     *   where: {
     *     // ... filter to delete one Position
     *   }
     * })
     * 
     */
    delete<T extends PositionDeleteArgs>(args: SelectSubset<T, PositionDeleteArgs<ExtArgs>>): Prisma__PositionClient<$Result.GetResult<Prisma.$PositionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Position.
     * @param {PositionUpdateArgs} args - Arguments to update one Position.
     * @example
     * // Update one Position
     * const position = await prisma.position.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PositionUpdateArgs>(args: SelectSubset<T, PositionUpdateArgs<ExtArgs>>): Prisma__PositionClient<$Result.GetResult<Prisma.$PositionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Positions.
     * @param {PositionDeleteManyArgs} args - Arguments to filter Positions to delete.
     * @example
     * // Delete a few Positions
     * const { count } = await prisma.position.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PositionDeleteManyArgs>(args?: SelectSubset<T, PositionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Positions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PositionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Positions
     * const position = await prisma.position.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PositionUpdateManyArgs>(args: SelectSubset<T, PositionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Positions and returns the data updated in the database.
     * @param {PositionUpdateManyAndReturnArgs} args - Arguments to update many Positions.
     * @example
     * // Update many Positions
     * const position = await prisma.position.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Positions and only return the `id`
     * const positionWithIdOnly = await prisma.position.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PositionUpdateManyAndReturnArgs>(args: SelectSubset<T, PositionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PositionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Position.
     * @param {PositionUpsertArgs} args - Arguments to update or create a Position.
     * @example
     * // Update or create a Position
     * const position = await prisma.position.upsert({
     *   create: {
     *     // ... data to create a Position
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Position we want to update
     *   }
     * })
     */
    upsert<T extends PositionUpsertArgs>(args: SelectSubset<T, PositionUpsertArgs<ExtArgs>>): Prisma__PositionClient<$Result.GetResult<Prisma.$PositionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Positions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PositionCountArgs} args - Arguments to filter Positions to count.
     * @example
     * // Count the number of Positions
     * const count = await prisma.position.count({
     *   where: {
     *     // ... the filter for the Positions we want to count
     *   }
     * })
    **/
    count<T extends PositionCountArgs>(
      args?: Subset<T, PositionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PositionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Position.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PositionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PositionAggregateArgs>(args: Subset<T, PositionAggregateArgs>): Prisma.PrismaPromise<GetPositionAggregateType<T>>

    /**
     * Group by Position.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PositionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PositionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PositionGroupByArgs['orderBy'] }
        : { orderBy?: PositionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PositionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPositionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Position model
   */
  readonly fields: PositionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Position.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PositionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Position model
   */
  interface PositionFieldRefs {
    readonly id: FieldRef<"Position", 'String'>
    readonly ticket: FieldRef<"Position", 'BigInt'>
    readonly symbol: FieldRef<"Position", 'String'>
    readonly side: FieldRef<"Position", 'TradeSide'>
    readonly volume: FieldRef<"Position", 'Float'>
    readonly openPrice: FieldRef<"Position", 'Float'>
    readonly currentPrice: FieldRef<"Position", 'Float'>
    readonly stopLoss: FieldRef<"Position", 'Float'>
    readonly takeProfit: FieldRef<"Position", 'Float'>
    readonly swap: FieldRef<"Position", 'Float'>
    readonly commission: FieldRef<"Position", 'Float'>
    readonly unrealizedProfit: FieldRef<"Position", 'Float'>
    readonly openedAt: FieldRef<"Position", 'DateTime'>
    readonly updatedAt: FieldRef<"Position", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Position findUnique
   */
  export type PositionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Position
     */
    select?: PositionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Position
     */
    omit?: PositionOmit<ExtArgs> | null
    /**
     * Filter, which Position to fetch.
     */
    where: PositionWhereUniqueInput
  }

  /**
   * Position findUniqueOrThrow
   */
  export type PositionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Position
     */
    select?: PositionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Position
     */
    omit?: PositionOmit<ExtArgs> | null
    /**
     * Filter, which Position to fetch.
     */
    where: PositionWhereUniqueInput
  }

  /**
   * Position findFirst
   */
  export type PositionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Position
     */
    select?: PositionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Position
     */
    omit?: PositionOmit<ExtArgs> | null
    /**
     * Filter, which Position to fetch.
     */
    where?: PositionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Positions to fetch.
     */
    orderBy?: PositionOrderByWithRelationInput | PositionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Positions.
     */
    cursor?: PositionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Positions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Positions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Positions.
     */
    distinct?: PositionScalarFieldEnum | PositionScalarFieldEnum[]
  }

  /**
   * Position findFirstOrThrow
   */
  export type PositionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Position
     */
    select?: PositionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Position
     */
    omit?: PositionOmit<ExtArgs> | null
    /**
     * Filter, which Position to fetch.
     */
    where?: PositionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Positions to fetch.
     */
    orderBy?: PositionOrderByWithRelationInput | PositionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Positions.
     */
    cursor?: PositionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Positions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Positions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Positions.
     */
    distinct?: PositionScalarFieldEnum | PositionScalarFieldEnum[]
  }

  /**
   * Position findMany
   */
  export type PositionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Position
     */
    select?: PositionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Position
     */
    omit?: PositionOmit<ExtArgs> | null
    /**
     * Filter, which Positions to fetch.
     */
    where?: PositionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Positions to fetch.
     */
    orderBy?: PositionOrderByWithRelationInput | PositionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Positions.
     */
    cursor?: PositionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Positions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Positions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Positions.
     */
    distinct?: PositionScalarFieldEnum | PositionScalarFieldEnum[]
  }

  /**
   * Position create
   */
  export type PositionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Position
     */
    select?: PositionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Position
     */
    omit?: PositionOmit<ExtArgs> | null
    /**
     * The data needed to create a Position.
     */
    data: XOR<PositionCreateInput, PositionUncheckedCreateInput>
  }

  /**
   * Position createMany
   */
  export type PositionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Positions.
     */
    data: PositionCreateManyInput | PositionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Position createManyAndReturn
   */
  export type PositionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Position
     */
    select?: PositionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Position
     */
    omit?: PositionOmit<ExtArgs> | null
    /**
     * The data used to create many Positions.
     */
    data: PositionCreateManyInput | PositionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Position update
   */
  export type PositionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Position
     */
    select?: PositionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Position
     */
    omit?: PositionOmit<ExtArgs> | null
    /**
     * The data needed to update a Position.
     */
    data: XOR<PositionUpdateInput, PositionUncheckedUpdateInput>
    /**
     * Choose, which Position to update.
     */
    where: PositionWhereUniqueInput
  }

  /**
   * Position updateMany
   */
  export type PositionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Positions.
     */
    data: XOR<PositionUpdateManyMutationInput, PositionUncheckedUpdateManyInput>
    /**
     * Filter which Positions to update
     */
    where?: PositionWhereInput
    /**
     * Limit how many Positions to update.
     */
    limit?: number
  }

  /**
   * Position updateManyAndReturn
   */
  export type PositionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Position
     */
    select?: PositionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Position
     */
    omit?: PositionOmit<ExtArgs> | null
    /**
     * The data used to update Positions.
     */
    data: XOR<PositionUpdateManyMutationInput, PositionUncheckedUpdateManyInput>
    /**
     * Filter which Positions to update
     */
    where?: PositionWhereInput
    /**
     * Limit how many Positions to update.
     */
    limit?: number
  }

  /**
   * Position upsert
   */
  export type PositionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Position
     */
    select?: PositionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Position
     */
    omit?: PositionOmit<ExtArgs> | null
    /**
     * The filter to search for the Position to update in case it exists.
     */
    where: PositionWhereUniqueInput
    /**
     * In case the Position found by the `where` argument doesn't exist, create a new Position with this data.
     */
    create: XOR<PositionCreateInput, PositionUncheckedCreateInput>
    /**
     * In case the Position was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PositionUpdateInput, PositionUncheckedUpdateInput>
  }

  /**
   * Position delete
   */
  export type PositionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Position
     */
    select?: PositionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Position
     */
    omit?: PositionOmit<ExtArgs> | null
    /**
     * Filter which Position to delete.
     */
    where: PositionWhereUniqueInput
  }

  /**
   * Position deleteMany
   */
  export type PositionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Positions to delete
     */
    where?: PositionWhereInput
    /**
     * Limit how many Positions to delete.
     */
    limit?: number
  }

  /**
   * Position without action
   */
  export type PositionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Position
     */
    select?: PositionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Position
     */
    omit?: PositionOmit<ExtArgs> | null
  }


  /**
   * Model Signal
   */

  export type AggregateSignal = {
    _count: SignalCountAggregateOutputType | null
    _avg: SignalAvgAggregateOutputType | null
    _sum: SignalSumAggregateOutputType | null
    _min: SignalMinAggregateOutputType | null
    _max: SignalMaxAggregateOutputType | null
  }

  export type SignalAvgAggregateOutputType = {
    score: number | null
  }

  export type SignalSumAggregateOutputType = {
    score: number | null
  }

  export type SignalMinAggregateOutputType = {
    id: string | null
    symbol: string | null
    timeframe: string | null
    direction: $Enums.SignalDirection | null
    score: number | null
    acted: boolean | null
    generatedAt: Date | null
  }

  export type SignalMaxAggregateOutputType = {
    id: string | null
    symbol: string | null
    timeframe: string | null
    direction: $Enums.SignalDirection | null
    score: number | null
    acted: boolean | null
    generatedAt: Date | null
  }

  export type SignalCountAggregateOutputType = {
    id: number
    symbol: number
    timeframe: number
    direction: number
    score: number
    acted: number
    indicators: number
    evaluation: number
    generatedAt: number
    _all: number
  }


  export type SignalAvgAggregateInputType = {
    score?: true
  }

  export type SignalSumAggregateInputType = {
    score?: true
  }

  export type SignalMinAggregateInputType = {
    id?: true
    symbol?: true
    timeframe?: true
    direction?: true
    score?: true
    acted?: true
    generatedAt?: true
  }

  export type SignalMaxAggregateInputType = {
    id?: true
    symbol?: true
    timeframe?: true
    direction?: true
    score?: true
    acted?: true
    generatedAt?: true
  }

  export type SignalCountAggregateInputType = {
    id?: true
    symbol?: true
    timeframe?: true
    direction?: true
    score?: true
    acted?: true
    indicators?: true
    evaluation?: true
    generatedAt?: true
    _all?: true
  }

  export type SignalAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Signal to aggregate.
     */
    where?: SignalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Signals to fetch.
     */
    orderBy?: SignalOrderByWithRelationInput | SignalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SignalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Signals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Signals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Signals
    **/
    _count?: true | SignalCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SignalAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SignalSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SignalMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SignalMaxAggregateInputType
  }

  export type GetSignalAggregateType<T extends SignalAggregateArgs> = {
        [P in keyof T & keyof AggregateSignal]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSignal[P]>
      : GetScalarType<T[P], AggregateSignal[P]>
  }




  export type SignalGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SignalWhereInput
    orderBy?: SignalOrderByWithAggregationInput | SignalOrderByWithAggregationInput[]
    by: SignalScalarFieldEnum[] | SignalScalarFieldEnum
    having?: SignalScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SignalCountAggregateInputType | true
    _avg?: SignalAvgAggregateInputType
    _sum?: SignalSumAggregateInputType
    _min?: SignalMinAggregateInputType
    _max?: SignalMaxAggregateInputType
  }

  export type SignalGroupByOutputType = {
    id: string
    symbol: string
    timeframe: string
    direction: $Enums.SignalDirection
    score: number
    acted: boolean
    indicators: JsonValue | null
    evaluation: JsonValue | null
    generatedAt: Date
    _count: SignalCountAggregateOutputType | null
    _avg: SignalAvgAggregateOutputType | null
    _sum: SignalSumAggregateOutputType | null
    _min: SignalMinAggregateOutputType | null
    _max: SignalMaxAggregateOutputType | null
  }

  type GetSignalGroupByPayload<T extends SignalGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SignalGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SignalGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SignalGroupByOutputType[P]>
            : GetScalarType<T[P], SignalGroupByOutputType[P]>
        }
      >
    >


  export type SignalSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    symbol?: boolean
    timeframe?: boolean
    direction?: boolean
    score?: boolean
    acted?: boolean
    indicators?: boolean
    evaluation?: boolean
    generatedAt?: boolean
    decisions?: boolean | Signal$decisionsArgs<ExtArgs>
    _count?: boolean | SignalCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["signal"]>

  export type SignalSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    symbol?: boolean
    timeframe?: boolean
    direction?: boolean
    score?: boolean
    acted?: boolean
    indicators?: boolean
    evaluation?: boolean
    generatedAt?: boolean
  }, ExtArgs["result"]["signal"]>

  export type SignalSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    symbol?: boolean
    timeframe?: boolean
    direction?: boolean
    score?: boolean
    acted?: boolean
    indicators?: boolean
    evaluation?: boolean
    generatedAt?: boolean
  }, ExtArgs["result"]["signal"]>

  export type SignalSelectScalar = {
    id?: boolean
    symbol?: boolean
    timeframe?: boolean
    direction?: boolean
    score?: boolean
    acted?: boolean
    indicators?: boolean
    evaluation?: boolean
    generatedAt?: boolean
  }

  export type SignalOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "symbol" | "timeframe" | "direction" | "score" | "acted" | "indicators" | "evaluation" | "generatedAt", ExtArgs["result"]["signal"]>
  export type SignalInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    decisions?: boolean | Signal$decisionsArgs<ExtArgs>
    _count?: boolean | SignalCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SignalIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type SignalIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $SignalPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Signal"
    objects: {
      decisions: Prisma.$DecisionLogPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      symbol: string
      timeframe: string
      direction: $Enums.SignalDirection
      score: number
      acted: boolean
      indicators: Prisma.JsonValue | null
      evaluation: Prisma.JsonValue | null
      generatedAt: Date
    }, ExtArgs["result"]["signal"]>
    composites: {}
  }

  type SignalGetPayload<S extends boolean | null | undefined | SignalDefaultArgs> = $Result.GetResult<Prisma.$SignalPayload, S>

  type SignalCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SignalFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SignalCountAggregateInputType | true
    }

  export interface SignalDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Signal'], meta: { name: 'Signal' } }
    /**
     * Find zero or one Signal that matches the filter.
     * @param {SignalFindUniqueArgs} args - Arguments to find a Signal
     * @example
     * // Get one Signal
     * const signal = await prisma.signal.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SignalFindUniqueArgs>(args: SelectSubset<T, SignalFindUniqueArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Signal that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SignalFindUniqueOrThrowArgs} args - Arguments to find a Signal
     * @example
     * // Get one Signal
     * const signal = await prisma.signal.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SignalFindUniqueOrThrowArgs>(args: SelectSubset<T, SignalFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Signal that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalFindFirstArgs} args - Arguments to find a Signal
     * @example
     * // Get one Signal
     * const signal = await prisma.signal.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SignalFindFirstArgs>(args?: SelectSubset<T, SignalFindFirstArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Signal that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalFindFirstOrThrowArgs} args - Arguments to find a Signal
     * @example
     * // Get one Signal
     * const signal = await prisma.signal.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SignalFindFirstOrThrowArgs>(args?: SelectSubset<T, SignalFindFirstOrThrowArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Signals that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Signals
     * const signals = await prisma.signal.findMany()
     * 
     * // Get first 10 Signals
     * const signals = await prisma.signal.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const signalWithIdOnly = await prisma.signal.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SignalFindManyArgs>(args?: SelectSubset<T, SignalFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Signal.
     * @param {SignalCreateArgs} args - Arguments to create a Signal.
     * @example
     * // Create one Signal
     * const Signal = await prisma.signal.create({
     *   data: {
     *     // ... data to create a Signal
     *   }
     * })
     * 
     */
    create<T extends SignalCreateArgs>(args: SelectSubset<T, SignalCreateArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Signals.
     * @param {SignalCreateManyArgs} args - Arguments to create many Signals.
     * @example
     * // Create many Signals
     * const signal = await prisma.signal.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SignalCreateManyArgs>(args?: SelectSubset<T, SignalCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Signals and returns the data saved in the database.
     * @param {SignalCreateManyAndReturnArgs} args - Arguments to create many Signals.
     * @example
     * // Create many Signals
     * const signal = await prisma.signal.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Signals and only return the `id`
     * const signalWithIdOnly = await prisma.signal.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SignalCreateManyAndReturnArgs>(args?: SelectSubset<T, SignalCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Signal.
     * @param {SignalDeleteArgs} args - Arguments to delete one Signal.
     * @example
     * // Delete one Signal
     * const Signal = await prisma.signal.delete({
     *   where: {
     *     // ... filter to delete one Signal
     *   }
     * })
     * 
     */
    delete<T extends SignalDeleteArgs>(args: SelectSubset<T, SignalDeleteArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Signal.
     * @param {SignalUpdateArgs} args - Arguments to update one Signal.
     * @example
     * // Update one Signal
     * const signal = await prisma.signal.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SignalUpdateArgs>(args: SelectSubset<T, SignalUpdateArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Signals.
     * @param {SignalDeleteManyArgs} args - Arguments to filter Signals to delete.
     * @example
     * // Delete a few Signals
     * const { count } = await prisma.signal.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SignalDeleteManyArgs>(args?: SelectSubset<T, SignalDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Signals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Signals
     * const signal = await prisma.signal.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SignalUpdateManyArgs>(args: SelectSubset<T, SignalUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Signals and returns the data updated in the database.
     * @param {SignalUpdateManyAndReturnArgs} args - Arguments to update many Signals.
     * @example
     * // Update many Signals
     * const signal = await prisma.signal.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Signals and only return the `id`
     * const signalWithIdOnly = await prisma.signal.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SignalUpdateManyAndReturnArgs>(args: SelectSubset<T, SignalUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Signal.
     * @param {SignalUpsertArgs} args - Arguments to update or create a Signal.
     * @example
     * // Update or create a Signal
     * const signal = await prisma.signal.upsert({
     *   create: {
     *     // ... data to create a Signal
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Signal we want to update
     *   }
     * })
     */
    upsert<T extends SignalUpsertArgs>(args: SelectSubset<T, SignalUpsertArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Signals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalCountArgs} args - Arguments to filter Signals to count.
     * @example
     * // Count the number of Signals
     * const count = await prisma.signal.count({
     *   where: {
     *     // ... the filter for the Signals we want to count
     *   }
     * })
    **/
    count<T extends SignalCountArgs>(
      args?: Subset<T, SignalCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SignalCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Signal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SignalAggregateArgs>(args: Subset<T, SignalAggregateArgs>): Prisma.PrismaPromise<GetSignalAggregateType<T>>

    /**
     * Group by Signal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignalGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SignalGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SignalGroupByArgs['orderBy'] }
        : { orderBy?: SignalGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SignalGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSignalGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Signal model
   */
  readonly fields: SignalFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Signal.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SignalClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    decisions<T extends Signal$decisionsArgs<ExtArgs> = {}>(args?: Subset<T, Signal$decisionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DecisionLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Signal model
   */
  interface SignalFieldRefs {
    readonly id: FieldRef<"Signal", 'String'>
    readonly symbol: FieldRef<"Signal", 'String'>
    readonly timeframe: FieldRef<"Signal", 'String'>
    readonly direction: FieldRef<"Signal", 'SignalDirection'>
    readonly score: FieldRef<"Signal", 'Float'>
    readonly acted: FieldRef<"Signal", 'Boolean'>
    readonly indicators: FieldRef<"Signal", 'Json'>
    readonly evaluation: FieldRef<"Signal", 'Json'>
    readonly generatedAt: FieldRef<"Signal", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Signal findUnique
   */
  export type SignalFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signal
     */
    omit?: SignalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    /**
     * Filter, which Signal to fetch.
     */
    where: SignalWhereUniqueInput
  }

  /**
   * Signal findUniqueOrThrow
   */
  export type SignalFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signal
     */
    omit?: SignalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    /**
     * Filter, which Signal to fetch.
     */
    where: SignalWhereUniqueInput
  }

  /**
   * Signal findFirst
   */
  export type SignalFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signal
     */
    omit?: SignalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    /**
     * Filter, which Signal to fetch.
     */
    where?: SignalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Signals to fetch.
     */
    orderBy?: SignalOrderByWithRelationInput | SignalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Signals.
     */
    cursor?: SignalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Signals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Signals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Signals.
     */
    distinct?: SignalScalarFieldEnum | SignalScalarFieldEnum[]
  }

  /**
   * Signal findFirstOrThrow
   */
  export type SignalFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signal
     */
    omit?: SignalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    /**
     * Filter, which Signal to fetch.
     */
    where?: SignalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Signals to fetch.
     */
    orderBy?: SignalOrderByWithRelationInput | SignalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Signals.
     */
    cursor?: SignalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Signals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Signals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Signals.
     */
    distinct?: SignalScalarFieldEnum | SignalScalarFieldEnum[]
  }

  /**
   * Signal findMany
   */
  export type SignalFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signal
     */
    omit?: SignalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    /**
     * Filter, which Signals to fetch.
     */
    where?: SignalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Signals to fetch.
     */
    orderBy?: SignalOrderByWithRelationInput | SignalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Signals.
     */
    cursor?: SignalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Signals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Signals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Signals.
     */
    distinct?: SignalScalarFieldEnum | SignalScalarFieldEnum[]
  }

  /**
   * Signal create
   */
  export type SignalCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signal
     */
    omit?: SignalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    /**
     * The data needed to create a Signal.
     */
    data: XOR<SignalCreateInput, SignalUncheckedCreateInput>
  }

  /**
   * Signal createMany
   */
  export type SignalCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Signals.
     */
    data: SignalCreateManyInput | SignalCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Signal createManyAndReturn
   */
  export type SignalCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Signal
     */
    omit?: SignalOmit<ExtArgs> | null
    /**
     * The data used to create many Signals.
     */
    data: SignalCreateManyInput | SignalCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Signal update
   */
  export type SignalUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signal
     */
    omit?: SignalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    /**
     * The data needed to update a Signal.
     */
    data: XOR<SignalUpdateInput, SignalUncheckedUpdateInput>
    /**
     * Choose, which Signal to update.
     */
    where: SignalWhereUniqueInput
  }

  /**
   * Signal updateMany
   */
  export type SignalUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Signals.
     */
    data: XOR<SignalUpdateManyMutationInput, SignalUncheckedUpdateManyInput>
    /**
     * Filter which Signals to update
     */
    where?: SignalWhereInput
    /**
     * Limit how many Signals to update.
     */
    limit?: number
  }

  /**
   * Signal updateManyAndReturn
   */
  export type SignalUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Signal
     */
    omit?: SignalOmit<ExtArgs> | null
    /**
     * The data used to update Signals.
     */
    data: XOR<SignalUpdateManyMutationInput, SignalUncheckedUpdateManyInput>
    /**
     * Filter which Signals to update
     */
    where?: SignalWhereInput
    /**
     * Limit how many Signals to update.
     */
    limit?: number
  }

  /**
   * Signal upsert
   */
  export type SignalUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signal
     */
    omit?: SignalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    /**
     * The filter to search for the Signal to update in case it exists.
     */
    where: SignalWhereUniqueInput
    /**
     * In case the Signal found by the `where` argument doesn't exist, create a new Signal with this data.
     */
    create: XOR<SignalCreateInput, SignalUncheckedCreateInput>
    /**
     * In case the Signal was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SignalUpdateInput, SignalUncheckedUpdateInput>
  }

  /**
   * Signal delete
   */
  export type SignalDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signal
     */
    omit?: SignalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    /**
     * Filter which Signal to delete.
     */
    where: SignalWhereUniqueInput
  }

  /**
   * Signal deleteMany
   */
  export type SignalDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Signals to delete
     */
    where?: SignalWhereInput
    /**
     * Limit how many Signals to delete.
     */
    limit?: number
  }

  /**
   * Signal.decisions
   */
  export type Signal$decisionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionLog
     */
    select?: DecisionLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DecisionLog
     */
    omit?: DecisionLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DecisionLogInclude<ExtArgs> | null
    where?: DecisionLogWhereInput
    orderBy?: DecisionLogOrderByWithRelationInput | DecisionLogOrderByWithRelationInput[]
    cursor?: DecisionLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DecisionLogScalarFieldEnum | DecisionLogScalarFieldEnum[]
  }

  /**
   * Signal without action
   */
  export type SignalDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signal
     */
    omit?: SignalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
  }


  /**
   * Model AccountSnapshot
   */

  export type AggregateAccountSnapshot = {
    _count: AccountSnapshotCountAggregateOutputType | null
    _avg: AccountSnapshotAvgAggregateOutputType | null
    _sum: AccountSnapshotSumAggregateOutputType | null
    _min: AccountSnapshotMinAggregateOutputType | null
    _max: AccountSnapshotMaxAggregateOutputType | null
  }

  export type AccountSnapshotAvgAggregateOutputType = {
    balance: number | null
    equity: number | null
    margin: number | null
    freeMargin: number | null
    marginLevel: number | null
    leverage: number | null
  }

  export type AccountSnapshotSumAggregateOutputType = {
    balance: number | null
    equity: number | null
    margin: number | null
    freeMargin: number | null
    marginLevel: number | null
    leverage: number | null
  }

  export type AccountSnapshotMinAggregateOutputType = {
    id: string | null
    balance: number | null
    equity: number | null
    margin: number | null
    freeMargin: number | null
    marginLevel: number | null
    currency: string | null
    leverage: number | null
    capturedAt: Date | null
  }

  export type AccountSnapshotMaxAggregateOutputType = {
    id: string | null
    balance: number | null
    equity: number | null
    margin: number | null
    freeMargin: number | null
    marginLevel: number | null
    currency: string | null
    leverage: number | null
    capturedAt: Date | null
  }

  export type AccountSnapshotCountAggregateOutputType = {
    id: number
    balance: number
    equity: number
    margin: number
    freeMargin: number
    marginLevel: number
    currency: number
    leverage: number
    capturedAt: number
    _all: number
  }


  export type AccountSnapshotAvgAggregateInputType = {
    balance?: true
    equity?: true
    margin?: true
    freeMargin?: true
    marginLevel?: true
    leverage?: true
  }

  export type AccountSnapshotSumAggregateInputType = {
    balance?: true
    equity?: true
    margin?: true
    freeMargin?: true
    marginLevel?: true
    leverage?: true
  }

  export type AccountSnapshotMinAggregateInputType = {
    id?: true
    balance?: true
    equity?: true
    margin?: true
    freeMargin?: true
    marginLevel?: true
    currency?: true
    leverage?: true
    capturedAt?: true
  }

  export type AccountSnapshotMaxAggregateInputType = {
    id?: true
    balance?: true
    equity?: true
    margin?: true
    freeMargin?: true
    marginLevel?: true
    currency?: true
    leverage?: true
    capturedAt?: true
  }

  export type AccountSnapshotCountAggregateInputType = {
    id?: true
    balance?: true
    equity?: true
    margin?: true
    freeMargin?: true
    marginLevel?: true
    currency?: true
    leverage?: true
    capturedAt?: true
    _all?: true
  }

  export type AccountSnapshotAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AccountSnapshot to aggregate.
     */
    where?: AccountSnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AccountSnapshots to fetch.
     */
    orderBy?: AccountSnapshotOrderByWithRelationInput | AccountSnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AccountSnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AccountSnapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AccountSnapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AccountSnapshots
    **/
    _count?: true | AccountSnapshotCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AccountSnapshotAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AccountSnapshotSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AccountSnapshotMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AccountSnapshotMaxAggregateInputType
  }

  export type GetAccountSnapshotAggregateType<T extends AccountSnapshotAggregateArgs> = {
        [P in keyof T & keyof AggregateAccountSnapshot]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAccountSnapshot[P]>
      : GetScalarType<T[P], AggregateAccountSnapshot[P]>
  }




  export type AccountSnapshotGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AccountSnapshotWhereInput
    orderBy?: AccountSnapshotOrderByWithAggregationInput | AccountSnapshotOrderByWithAggregationInput[]
    by: AccountSnapshotScalarFieldEnum[] | AccountSnapshotScalarFieldEnum
    having?: AccountSnapshotScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AccountSnapshotCountAggregateInputType | true
    _avg?: AccountSnapshotAvgAggregateInputType
    _sum?: AccountSnapshotSumAggregateInputType
    _min?: AccountSnapshotMinAggregateInputType
    _max?: AccountSnapshotMaxAggregateInputType
  }

  export type AccountSnapshotGroupByOutputType = {
    id: string
    balance: number
    equity: number
    margin: number
    freeMargin: number
    marginLevel: number | null
    currency: string
    leverage: number | null
    capturedAt: Date
    _count: AccountSnapshotCountAggregateOutputType | null
    _avg: AccountSnapshotAvgAggregateOutputType | null
    _sum: AccountSnapshotSumAggregateOutputType | null
    _min: AccountSnapshotMinAggregateOutputType | null
    _max: AccountSnapshotMaxAggregateOutputType | null
  }

  type GetAccountSnapshotGroupByPayload<T extends AccountSnapshotGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AccountSnapshotGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AccountSnapshotGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AccountSnapshotGroupByOutputType[P]>
            : GetScalarType<T[P], AccountSnapshotGroupByOutputType[P]>
        }
      >
    >


  export type AccountSnapshotSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    balance?: boolean
    equity?: boolean
    margin?: boolean
    freeMargin?: boolean
    marginLevel?: boolean
    currency?: boolean
    leverage?: boolean
    capturedAt?: boolean
  }, ExtArgs["result"]["accountSnapshot"]>

  export type AccountSnapshotSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    balance?: boolean
    equity?: boolean
    margin?: boolean
    freeMargin?: boolean
    marginLevel?: boolean
    currency?: boolean
    leverage?: boolean
    capturedAt?: boolean
  }, ExtArgs["result"]["accountSnapshot"]>

  export type AccountSnapshotSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    balance?: boolean
    equity?: boolean
    margin?: boolean
    freeMargin?: boolean
    marginLevel?: boolean
    currency?: boolean
    leverage?: boolean
    capturedAt?: boolean
  }, ExtArgs["result"]["accountSnapshot"]>

  export type AccountSnapshotSelectScalar = {
    id?: boolean
    balance?: boolean
    equity?: boolean
    margin?: boolean
    freeMargin?: boolean
    marginLevel?: boolean
    currency?: boolean
    leverage?: boolean
    capturedAt?: boolean
  }

  export type AccountSnapshotOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "balance" | "equity" | "margin" | "freeMargin" | "marginLevel" | "currency" | "leverage" | "capturedAt", ExtArgs["result"]["accountSnapshot"]>

  export type $AccountSnapshotPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AccountSnapshot"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      balance: number
      equity: number
      margin: number
      freeMargin: number
      marginLevel: number | null
      currency: string
      leverage: number | null
      capturedAt: Date
    }, ExtArgs["result"]["accountSnapshot"]>
    composites: {}
  }

  type AccountSnapshotGetPayload<S extends boolean | null | undefined | AccountSnapshotDefaultArgs> = $Result.GetResult<Prisma.$AccountSnapshotPayload, S>

  type AccountSnapshotCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AccountSnapshotFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AccountSnapshotCountAggregateInputType | true
    }

  export interface AccountSnapshotDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AccountSnapshot'], meta: { name: 'AccountSnapshot' } }
    /**
     * Find zero or one AccountSnapshot that matches the filter.
     * @param {AccountSnapshotFindUniqueArgs} args - Arguments to find a AccountSnapshot
     * @example
     * // Get one AccountSnapshot
     * const accountSnapshot = await prisma.accountSnapshot.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AccountSnapshotFindUniqueArgs>(args: SelectSubset<T, AccountSnapshotFindUniqueArgs<ExtArgs>>): Prisma__AccountSnapshotClient<$Result.GetResult<Prisma.$AccountSnapshotPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AccountSnapshot that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AccountSnapshotFindUniqueOrThrowArgs} args - Arguments to find a AccountSnapshot
     * @example
     * // Get one AccountSnapshot
     * const accountSnapshot = await prisma.accountSnapshot.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AccountSnapshotFindUniqueOrThrowArgs>(args: SelectSubset<T, AccountSnapshotFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AccountSnapshotClient<$Result.GetResult<Prisma.$AccountSnapshotPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AccountSnapshot that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountSnapshotFindFirstArgs} args - Arguments to find a AccountSnapshot
     * @example
     * // Get one AccountSnapshot
     * const accountSnapshot = await prisma.accountSnapshot.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AccountSnapshotFindFirstArgs>(args?: SelectSubset<T, AccountSnapshotFindFirstArgs<ExtArgs>>): Prisma__AccountSnapshotClient<$Result.GetResult<Prisma.$AccountSnapshotPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AccountSnapshot that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountSnapshotFindFirstOrThrowArgs} args - Arguments to find a AccountSnapshot
     * @example
     * // Get one AccountSnapshot
     * const accountSnapshot = await prisma.accountSnapshot.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AccountSnapshotFindFirstOrThrowArgs>(args?: SelectSubset<T, AccountSnapshotFindFirstOrThrowArgs<ExtArgs>>): Prisma__AccountSnapshotClient<$Result.GetResult<Prisma.$AccountSnapshotPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AccountSnapshots that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountSnapshotFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AccountSnapshots
     * const accountSnapshots = await prisma.accountSnapshot.findMany()
     * 
     * // Get first 10 AccountSnapshots
     * const accountSnapshots = await prisma.accountSnapshot.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const accountSnapshotWithIdOnly = await prisma.accountSnapshot.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AccountSnapshotFindManyArgs>(args?: SelectSubset<T, AccountSnapshotFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountSnapshotPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AccountSnapshot.
     * @param {AccountSnapshotCreateArgs} args - Arguments to create a AccountSnapshot.
     * @example
     * // Create one AccountSnapshot
     * const AccountSnapshot = await prisma.accountSnapshot.create({
     *   data: {
     *     // ... data to create a AccountSnapshot
     *   }
     * })
     * 
     */
    create<T extends AccountSnapshotCreateArgs>(args: SelectSubset<T, AccountSnapshotCreateArgs<ExtArgs>>): Prisma__AccountSnapshotClient<$Result.GetResult<Prisma.$AccountSnapshotPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AccountSnapshots.
     * @param {AccountSnapshotCreateManyArgs} args - Arguments to create many AccountSnapshots.
     * @example
     * // Create many AccountSnapshots
     * const accountSnapshot = await prisma.accountSnapshot.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AccountSnapshotCreateManyArgs>(args?: SelectSubset<T, AccountSnapshotCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AccountSnapshots and returns the data saved in the database.
     * @param {AccountSnapshotCreateManyAndReturnArgs} args - Arguments to create many AccountSnapshots.
     * @example
     * // Create many AccountSnapshots
     * const accountSnapshot = await prisma.accountSnapshot.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AccountSnapshots and only return the `id`
     * const accountSnapshotWithIdOnly = await prisma.accountSnapshot.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AccountSnapshotCreateManyAndReturnArgs>(args?: SelectSubset<T, AccountSnapshotCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountSnapshotPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AccountSnapshot.
     * @param {AccountSnapshotDeleteArgs} args - Arguments to delete one AccountSnapshot.
     * @example
     * // Delete one AccountSnapshot
     * const AccountSnapshot = await prisma.accountSnapshot.delete({
     *   where: {
     *     // ... filter to delete one AccountSnapshot
     *   }
     * })
     * 
     */
    delete<T extends AccountSnapshotDeleteArgs>(args: SelectSubset<T, AccountSnapshotDeleteArgs<ExtArgs>>): Prisma__AccountSnapshotClient<$Result.GetResult<Prisma.$AccountSnapshotPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AccountSnapshot.
     * @param {AccountSnapshotUpdateArgs} args - Arguments to update one AccountSnapshot.
     * @example
     * // Update one AccountSnapshot
     * const accountSnapshot = await prisma.accountSnapshot.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AccountSnapshotUpdateArgs>(args: SelectSubset<T, AccountSnapshotUpdateArgs<ExtArgs>>): Prisma__AccountSnapshotClient<$Result.GetResult<Prisma.$AccountSnapshotPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AccountSnapshots.
     * @param {AccountSnapshotDeleteManyArgs} args - Arguments to filter AccountSnapshots to delete.
     * @example
     * // Delete a few AccountSnapshots
     * const { count } = await prisma.accountSnapshot.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AccountSnapshotDeleteManyArgs>(args?: SelectSubset<T, AccountSnapshotDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AccountSnapshots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountSnapshotUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AccountSnapshots
     * const accountSnapshot = await prisma.accountSnapshot.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AccountSnapshotUpdateManyArgs>(args: SelectSubset<T, AccountSnapshotUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AccountSnapshots and returns the data updated in the database.
     * @param {AccountSnapshotUpdateManyAndReturnArgs} args - Arguments to update many AccountSnapshots.
     * @example
     * // Update many AccountSnapshots
     * const accountSnapshot = await prisma.accountSnapshot.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AccountSnapshots and only return the `id`
     * const accountSnapshotWithIdOnly = await prisma.accountSnapshot.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AccountSnapshotUpdateManyAndReturnArgs>(args: SelectSubset<T, AccountSnapshotUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountSnapshotPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AccountSnapshot.
     * @param {AccountSnapshotUpsertArgs} args - Arguments to update or create a AccountSnapshot.
     * @example
     * // Update or create a AccountSnapshot
     * const accountSnapshot = await prisma.accountSnapshot.upsert({
     *   create: {
     *     // ... data to create a AccountSnapshot
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AccountSnapshot we want to update
     *   }
     * })
     */
    upsert<T extends AccountSnapshotUpsertArgs>(args: SelectSubset<T, AccountSnapshotUpsertArgs<ExtArgs>>): Prisma__AccountSnapshotClient<$Result.GetResult<Prisma.$AccountSnapshotPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AccountSnapshots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountSnapshotCountArgs} args - Arguments to filter AccountSnapshots to count.
     * @example
     * // Count the number of AccountSnapshots
     * const count = await prisma.accountSnapshot.count({
     *   where: {
     *     // ... the filter for the AccountSnapshots we want to count
     *   }
     * })
    **/
    count<T extends AccountSnapshotCountArgs>(
      args?: Subset<T, AccountSnapshotCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AccountSnapshotCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AccountSnapshot.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountSnapshotAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AccountSnapshotAggregateArgs>(args: Subset<T, AccountSnapshotAggregateArgs>): Prisma.PrismaPromise<GetAccountSnapshotAggregateType<T>>

    /**
     * Group by AccountSnapshot.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountSnapshotGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AccountSnapshotGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AccountSnapshotGroupByArgs['orderBy'] }
        : { orderBy?: AccountSnapshotGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AccountSnapshotGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAccountSnapshotGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AccountSnapshot model
   */
  readonly fields: AccountSnapshotFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AccountSnapshot.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AccountSnapshotClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AccountSnapshot model
   */
  interface AccountSnapshotFieldRefs {
    readonly id: FieldRef<"AccountSnapshot", 'String'>
    readonly balance: FieldRef<"AccountSnapshot", 'Float'>
    readonly equity: FieldRef<"AccountSnapshot", 'Float'>
    readonly margin: FieldRef<"AccountSnapshot", 'Float'>
    readonly freeMargin: FieldRef<"AccountSnapshot", 'Float'>
    readonly marginLevel: FieldRef<"AccountSnapshot", 'Float'>
    readonly currency: FieldRef<"AccountSnapshot", 'String'>
    readonly leverage: FieldRef<"AccountSnapshot", 'Int'>
    readonly capturedAt: FieldRef<"AccountSnapshot", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AccountSnapshot findUnique
   */
  export type AccountSnapshotFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountSnapshot
     */
    select?: AccountSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountSnapshot
     */
    omit?: AccountSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which AccountSnapshot to fetch.
     */
    where: AccountSnapshotWhereUniqueInput
  }

  /**
   * AccountSnapshot findUniqueOrThrow
   */
  export type AccountSnapshotFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountSnapshot
     */
    select?: AccountSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountSnapshot
     */
    omit?: AccountSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which AccountSnapshot to fetch.
     */
    where: AccountSnapshotWhereUniqueInput
  }

  /**
   * AccountSnapshot findFirst
   */
  export type AccountSnapshotFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountSnapshot
     */
    select?: AccountSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountSnapshot
     */
    omit?: AccountSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which AccountSnapshot to fetch.
     */
    where?: AccountSnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AccountSnapshots to fetch.
     */
    orderBy?: AccountSnapshotOrderByWithRelationInput | AccountSnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AccountSnapshots.
     */
    cursor?: AccountSnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AccountSnapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AccountSnapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AccountSnapshots.
     */
    distinct?: AccountSnapshotScalarFieldEnum | AccountSnapshotScalarFieldEnum[]
  }

  /**
   * AccountSnapshot findFirstOrThrow
   */
  export type AccountSnapshotFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountSnapshot
     */
    select?: AccountSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountSnapshot
     */
    omit?: AccountSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which AccountSnapshot to fetch.
     */
    where?: AccountSnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AccountSnapshots to fetch.
     */
    orderBy?: AccountSnapshotOrderByWithRelationInput | AccountSnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AccountSnapshots.
     */
    cursor?: AccountSnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AccountSnapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AccountSnapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AccountSnapshots.
     */
    distinct?: AccountSnapshotScalarFieldEnum | AccountSnapshotScalarFieldEnum[]
  }

  /**
   * AccountSnapshot findMany
   */
  export type AccountSnapshotFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountSnapshot
     */
    select?: AccountSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountSnapshot
     */
    omit?: AccountSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which AccountSnapshots to fetch.
     */
    where?: AccountSnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AccountSnapshots to fetch.
     */
    orderBy?: AccountSnapshotOrderByWithRelationInput | AccountSnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AccountSnapshots.
     */
    cursor?: AccountSnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AccountSnapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AccountSnapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AccountSnapshots.
     */
    distinct?: AccountSnapshotScalarFieldEnum | AccountSnapshotScalarFieldEnum[]
  }

  /**
   * AccountSnapshot create
   */
  export type AccountSnapshotCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountSnapshot
     */
    select?: AccountSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountSnapshot
     */
    omit?: AccountSnapshotOmit<ExtArgs> | null
    /**
     * The data needed to create a AccountSnapshot.
     */
    data: XOR<AccountSnapshotCreateInput, AccountSnapshotUncheckedCreateInput>
  }

  /**
   * AccountSnapshot createMany
   */
  export type AccountSnapshotCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AccountSnapshots.
     */
    data: AccountSnapshotCreateManyInput | AccountSnapshotCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AccountSnapshot createManyAndReturn
   */
  export type AccountSnapshotCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountSnapshot
     */
    select?: AccountSnapshotSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AccountSnapshot
     */
    omit?: AccountSnapshotOmit<ExtArgs> | null
    /**
     * The data used to create many AccountSnapshots.
     */
    data: AccountSnapshotCreateManyInput | AccountSnapshotCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AccountSnapshot update
   */
  export type AccountSnapshotUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountSnapshot
     */
    select?: AccountSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountSnapshot
     */
    omit?: AccountSnapshotOmit<ExtArgs> | null
    /**
     * The data needed to update a AccountSnapshot.
     */
    data: XOR<AccountSnapshotUpdateInput, AccountSnapshotUncheckedUpdateInput>
    /**
     * Choose, which AccountSnapshot to update.
     */
    where: AccountSnapshotWhereUniqueInput
  }

  /**
   * AccountSnapshot updateMany
   */
  export type AccountSnapshotUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AccountSnapshots.
     */
    data: XOR<AccountSnapshotUpdateManyMutationInput, AccountSnapshotUncheckedUpdateManyInput>
    /**
     * Filter which AccountSnapshots to update
     */
    where?: AccountSnapshotWhereInput
    /**
     * Limit how many AccountSnapshots to update.
     */
    limit?: number
  }

  /**
   * AccountSnapshot updateManyAndReturn
   */
  export type AccountSnapshotUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountSnapshot
     */
    select?: AccountSnapshotSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AccountSnapshot
     */
    omit?: AccountSnapshotOmit<ExtArgs> | null
    /**
     * The data used to update AccountSnapshots.
     */
    data: XOR<AccountSnapshotUpdateManyMutationInput, AccountSnapshotUncheckedUpdateManyInput>
    /**
     * Filter which AccountSnapshots to update
     */
    where?: AccountSnapshotWhereInput
    /**
     * Limit how many AccountSnapshots to update.
     */
    limit?: number
  }

  /**
   * AccountSnapshot upsert
   */
  export type AccountSnapshotUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountSnapshot
     */
    select?: AccountSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountSnapshot
     */
    omit?: AccountSnapshotOmit<ExtArgs> | null
    /**
     * The filter to search for the AccountSnapshot to update in case it exists.
     */
    where: AccountSnapshotWhereUniqueInput
    /**
     * In case the AccountSnapshot found by the `where` argument doesn't exist, create a new AccountSnapshot with this data.
     */
    create: XOR<AccountSnapshotCreateInput, AccountSnapshotUncheckedCreateInput>
    /**
     * In case the AccountSnapshot was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AccountSnapshotUpdateInput, AccountSnapshotUncheckedUpdateInput>
  }

  /**
   * AccountSnapshot delete
   */
  export type AccountSnapshotDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountSnapshot
     */
    select?: AccountSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountSnapshot
     */
    omit?: AccountSnapshotOmit<ExtArgs> | null
    /**
     * Filter which AccountSnapshot to delete.
     */
    where: AccountSnapshotWhereUniqueInput
  }

  /**
   * AccountSnapshot deleteMany
   */
  export type AccountSnapshotDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AccountSnapshots to delete
     */
    where?: AccountSnapshotWhereInput
    /**
     * Limit how many AccountSnapshots to delete.
     */
    limit?: number
  }

  /**
   * AccountSnapshot without action
   */
  export type AccountSnapshotDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountSnapshot
     */
    select?: AccountSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AccountSnapshot
     */
    omit?: AccountSnapshotOmit<ExtArgs> | null
  }


  /**
   * Model RiskSnapshot
   */

  export type AggregateRiskSnapshot = {
    _count: RiskSnapshotCountAggregateOutputType | null
    _avg: RiskSnapshotAvgAggregateOutputType | null
    _sum: RiskSnapshotSumAggregateOutputType | null
    _min: RiskSnapshotMinAggregateOutputType | null
    _max: RiskSnapshotMaxAggregateOutputType | null
  }

  export type RiskSnapshotAvgAggregateOutputType = {
    dailyPnl: number | null
    dailyDrawdownPct: number | null
    maxDrawdownPct: number | null
    openRiskPct: number | null
    exposurePct: number | null
    riskPerTradePct: number | null
    openPositions: number | null
    marginLevel: number | null
  }

  export type RiskSnapshotSumAggregateOutputType = {
    dailyPnl: number | null
    dailyDrawdownPct: number | null
    maxDrawdownPct: number | null
    openRiskPct: number | null
    exposurePct: number | null
    riskPerTradePct: number | null
    openPositions: number | null
    marginLevel: number | null
  }

  export type RiskSnapshotMinAggregateOutputType = {
    id: string | null
    dailyPnl: number | null
    dailyDrawdownPct: number | null
    maxDrawdownPct: number | null
    openRiskPct: number | null
    exposurePct: number | null
    riskPerTradePct: number | null
    openPositions: number | null
    marginLevel: number | null
    capturedAt: Date | null
  }

  export type RiskSnapshotMaxAggregateOutputType = {
    id: string | null
    dailyPnl: number | null
    dailyDrawdownPct: number | null
    maxDrawdownPct: number | null
    openRiskPct: number | null
    exposurePct: number | null
    riskPerTradePct: number | null
    openPositions: number | null
    marginLevel: number | null
    capturedAt: Date | null
  }

  export type RiskSnapshotCountAggregateOutputType = {
    id: number
    dailyPnl: number
    dailyDrawdownPct: number
    maxDrawdownPct: number
    openRiskPct: number
    exposurePct: number
    riskPerTradePct: number
    openPositions: number
    marginLevel: number
    capturedAt: number
    _all: number
  }


  export type RiskSnapshotAvgAggregateInputType = {
    dailyPnl?: true
    dailyDrawdownPct?: true
    maxDrawdownPct?: true
    openRiskPct?: true
    exposurePct?: true
    riskPerTradePct?: true
    openPositions?: true
    marginLevel?: true
  }

  export type RiskSnapshotSumAggregateInputType = {
    dailyPnl?: true
    dailyDrawdownPct?: true
    maxDrawdownPct?: true
    openRiskPct?: true
    exposurePct?: true
    riskPerTradePct?: true
    openPositions?: true
    marginLevel?: true
  }

  export type RiskSnapshotMinAggregateInputType = {
    id?: true
    dailyPnl?: true
    dailyDrawdownPct?: true
    maxDrawdownPct?: true
    openRiskPct?: true
    exposurePct?: true
    riskPerTradePct?: true
    openPositions?: true
    marginLevel?: true
    capturedAt?: true
  }

  export type RiskSnapshotMaxAggregateInputType = {
    id?: true
    dailyPnl?: true
    dailyDrawdownPct?: true
    maxDrawdownPct?: true
    openRiskPct?: true
    exposurePct?: true
    riskPerTradePct?: true
    openPositions?: true
    marginLevel?: true
    capturedAt?: true
  }

  export type RiskSnapshotCountAggregateInputType = {
    id?: true
    dailyPnl?: true
    dailyDrawdownPct?: true
    maxDrawdownPct?: true
    openRiskPct?: true
    exposurePct?: true
    riskPerTradePct?: true
    openPositions?: true
    marginLevel?: true
    capturedAt?: true
    _all?: true
  }

  export type RiskSnapshotAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RiskSnapshot to aggregate.
     */
    where?: RiskSnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RiskSnapshots to fetch.
     */
    orderBy?: RiskSnapshotOrderByWithRelationInput | RiskSnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RiskSnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RiskSnapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RiskSnapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RiskSnapshots
    **/
    _count?: true | RiskSnapshotCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RiskSnapshotAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RiskSnapshotSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RiskSnapshotMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RiskSnapshotMaxAggregateInputType
  }

  export type GetRiskSnapshotAggregateType<T extends RiskSnapshotAggregateArgs> = {
        [P in keyof T & keyof AggregateRiskSnapshot]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRiskSnapshot[P]>
      : GetScalarType<T[P], AggregateRiskSnapshot[P]>
  }




  export type RiskSnapshotGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RiskSnapshotWhereInput
    orderBy?: RiskSnapshotOrderByWithAggregationInput | RiskSnapshotOrderByWithAggregationInput[]
    by: RiskSnapshotScalarFieldEnum[] | RiskSnapshotScalarFieldEnum
    having?: RiskSnapshotScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RiskSnapshotCountAggregateInputType | true
    _avg?: RiskSnapshotAvgAggregateInputType
    _sum?: RiskSnapshotSumAggregateInputType
    _min?: RiskSnapshotMinAggregateInputType
    _max?: RiskSnapshotMaxAggregateInputType
  }

  export type RiskSnapshotGroupByOutputType = {
    id: string
    dailyPnl: number
    dailyDrawdownPct: number
    maxDrawdownPct: number
    openRiskPct: number
    exposurePct: number
    riskPerTradePct: number
    openPositions: number
    marginLevel: number | null
    capturedAt: Date
    _count: RiskSnapshotCountAggregateOutputType | null
    _avg: RiskSnapshotAvgAggregateOutputType | null
    _sum: RiskSnapshotSumAggregateOutputType | null
    _min: RiskSnapshotMinAggregateOutputType | null
    _max: RiskSnapshotMaxAggregateOutputType | null
  }

  type GetRiskSnapshotGroupByPayload<T extends RiskSnapshotGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RiskSnapshotGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RiskSnapshotGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RiskSnapshotGroupByOutputType[P]>
            : GetScalarType<T[P], RiskSnapshotGroupByOutputType[P]>
        }
      >
    >


  export type RiskSnapshotSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    dailyPnl?: boolean
    dailyDrawdownPct?: boolean
    maxDrawdownPct?: boolean
    openRiskPct?: boolean
    exposurePct?: boolean
    riskPerTradePct?: boolean
    openPositions?: boolean
    marginLevel?: boolean
    capturedAt?: boolean
  }, ExtArgs["result"]["riskSnapshot"]>

  export type RiskSnapshotSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    dailyPnl?: boolean
    dailyDrawdownPct?: boolean
    maxDrawdownPct?: boolean
    openRiskPct?: boolean
    exposurePct?: boolean
    riskPerTradePct?: boolean
    openPositions?: boolean
    marginLevel?: boolean
    capturedAt?: boolean
  }, ExtArgs["result"]["riskSnapshot"]>

  export type RiskSnapshotSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    dailyPnl?: boolean
    dailyDrawdownPct?: boolean
    maxDrawdownPct?: boolean
    openRiskPct?: boolean
    exposurePct?: boolean
    riskPerTradePct?: boolean
    openPositions?: boolean
    marginLevel?: boolean
    capturedAt?: boolean
  }, ExtArgs["result"]["riskSnapshot"]>

  export type RiskSnapshotSelectScalar = {
    id?: boolean
    dailyPnl?: boolean
    dailyDrawdownPct?: boolean
    maxDrawdownPct?: boolean
    openRiskPct?: boolean
    exposurePct?: boolean
    riskPerTradePct?: boolean
    openPositions?: boolean
    marginLevel?: boolean
    capturedAt?: boolean
  }

  export type RiskSnapshotOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "dailyPnl" | "dailyDrawdownPct" | "maxDrawdownPct" | "openRiskPct" | "exposurePct" | "riskPerTradePct" | "openPositions" | "marginLevel" | "capturedAt", ExtArgs["result"]["riskSnapshot"]>

  export type $RiskSnapshotPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RiskSnapshot"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      dailyPnl: number
      dailyDrawdownPct: number
      maxDrawdownPct: number
      openRiskPct: number
      exposurePct: number
      riskPerTradePct: number
      openPositions: number
      marginLevel: number | null
      capturedAt: Date
    }, ExtArgs["result"]["riskSnapshot"]>
    composites: {}
  }

  type RiskSnapshotGetPayload<S extends boolean | null | undefined | RiskSnapshotDefaultArgs> = $Result.GetResult<Prisma.$RiskSnapshotPayload, S>

  type RiskSnapshotCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RiskSnapshotFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RiskSnapshotCountAggregateInputType | true
    }

  export interface RiskSnapshotDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RiskSnapshot'], meta: { name: 'RiskSnapshot' } }
    /**
     * Find zero or one RiskSnapshot that matches the filter.
     * @param {RiskSnapshotFindUniqueArgs} args - Arguments to find a RiskSnapshot
     * @example
     * // Get one RiskSnapshot
     * const riskSnapshot = await prisma.riskSnapshot.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RiskSnapshotFindUniqueArgs>(args: SelectSubset<T, RiskSnapshotFindUniqueArgs<ExtArgs>>): Prisma__RiskSnapshotClient<$Result.GetResult<Prisma.$RiskSnapshotPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one RiskSnapshot that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RiskSnapshotFindUniqueOrThrowArgs} args - Arguments to find a RiskSnapshot
     * @example
     * // Get one RiskSnapshot
     * const riskSnapshot = await prisma.riskSnapshot.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RiskSnapshotFindUniqueOrThrowArgs>(args: SelectSubset<T, RiskSnapshotFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RiskSnapshotClient<$Result.GetResult<Prisma.$RiskSnapshotPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RiskSnapshot that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RiskSnapshotFindFirstArgs} args - Arguments to find a RiskSnapshot
     * @example
     * // Get one RiskSnapshot
     * const riskSnapshot = await prisma.riskSnapshot.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RiskSnapshotFindFirstArgs>(args?: SelectSubset<T, RiskSnapshotFindFirstArgs<ExtArgs>>): Prisma__RiskSnapshotClient<$Result.GetResult<Prisma.$RiskSnapshotPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first RiskSnapshot that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RiskSnapshotFindFirstOrThrowArgs} args - Arguments to find a RiskSnapshot
     * @example
     * // Get one RiskSnapshot
     * const riskSnapshot = await prisma.riskSnapshot.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RiskSnapshotFindFirstOrThrowArgs>(args?: SelectSubset<T, RiskSnapshotFindFirstOrThrowArgs<ExtArgs>>): Prisma__RiskSnapshotClient<$Result.GetResult<Prisma.$RiskSnapshotPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more RiskSnapshots that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RiskSnapshotFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RiskSnapshots
     * const riskSnapshots = await prisma.riskSnapshot.findMany()
     * 
     * // Get first 10 RiskSnapshots
     * const riskSnapshots = await prisma.riskSnapshot.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const riskSnapshotWithIdOnly = await prisma.riskSnapshot.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RiskSnapshotFindManyArgs>(args?: SelectSubset<T, RiskSnapshotFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RiskSnapshotPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a RiskSnapshot.
     * @param {RiskSnapshotCreateArgs} args - Arguments to create a RiskSnapshot.
     * @example
     * // Create one RiskSnapshot
     * const RiskSnapshot = await prisma.riskSnapshot.create({
     *   data: {
     *     // ... data to create a RiskSnapshot
     *   }
     * })
     * 
     */
    create<T extends RiskSnapshotCreateArgs>(args: SelectSubset<T, RiskSnapshotCreateArgs<ExtArgs>>): Prisma__RiskSnapshotClient<$Result.GetResult<Prisma.$RiskSnapshotPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many RiskSnapshots.
     * @param {RiskSnapshotCreateManyArgs} args - Arguments to create many RiskSnapshots.
     * @example
     * // Create many RiskSnapshots
     * const riskSnapshot = await prisma.riskSnapshot.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RiskSnapshotCreateManyArgs>(args?: SelectSubset<T, RiskSnapshotCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RiskSnapshots and returns the data saved in the database.
     * @param {RiskSnapshotCreateManyAndReturnArgs} args - Arguments to create many RiskSnapshots.
     * @example
     * // Create many RiskSnapshots
     * const riskSnapshot = await prisma.riskSnapshot.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RiskSnapshots and only return the `id`
     * const riskSnapshotWithIdOnly = await prisma.riskSnapshot.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RiskSnapshotCreateManyAndReturnArgs>(args?: SelectSubset<T, RiskSnapshotCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RiskSnapshotPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a RiskSnapshot.
     * @param {RiskSnapshotDeleteArgs} args - Arguments to delete one RiskSnapshot.
     * @example
     * // Delete one RiskSnapshot
     * const RiskSnapshot = await prisma.riskSnapshot.delete({
     *   where: {
     *     // ... filter to delete one RiskSnapshot
     *   }
     * })
     * 
     */
    delete<T extends RiskSnapshotDeleteArgs>(args: SelectSubset<T, RiskSnapshotDeleteArgs<ExtArgs>>): Prisma__RiskSnapshotClient<$Result.GetResult<Prisma.$RiskSnapshotPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one RiskSnapshot.
     * @param {RiskSnapshotUpdateArgs} args - Arguments to update one RiskSnapshot.
     * @example
     * // Update one RiskSnapshot
     * const riskSnapshot = await prisma.riskSnapshot.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RiskSnapshotUpdateArgs>(args: SelectSubset<T, RiskSnapshotUpdateArgs<ExtArgs>>): Prisma__RiskSnapshotClient<$Result.GetResult<Prisma.$RiskSnapshotPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more RiskSnapshots.
     * @param {RiskSnapshotDeleteManyArgs} args - Arguments to filter RiskSnapshots to delete.
     * @example
     * // Delete a few RiskSnapshots
     * const { count } = await prisma.riskSnapshot.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RiskSnapshotDeleteManyArgs>(args?: SelectSubset<T, RiskSnapshotDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RiskSnapshots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RiskSnapshotUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RiskSnapshots
     * const riskSnapshot = await prisma.riskSnapshot.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RiskSnapshotUpdateManyArgs>(args: SelectSubset<T, RiskSnapshotUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RiskSnapshots and returns the data updated in the database.
     * @param {RiskSnapshotUpdateManyAndReturnArgs} args - Arguments to update many RiskSnapshots.
     * @example
     * // Update many RiskSnapshots
     * const riskSnapshot = await prisma.riskSnapshot.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more RiskSnapshots and only return the `id`
     * const riskSnapshotWithIdOnly = await prisma.riskSnapshot.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RiskSnapshotUpdateManyAndReturnArgs>(args: SelectSubset<T, RiskSnapshotUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RiskSnapshotPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one RiskSnapshot.
     * @param {RiskSnapshotUpsertArgs} args - Arguments to update or create a RiskSnapshot.
     * @example
     * // Update or create a RiskSnapshot
     * const riskSnapshot = await prisma.riskSnapshot.upsert({
     *   create: {
     *     // ... data to create a RiskSnapshot
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RiskSnapshot we want to update
     *   }
     * })
     */
    upsert<T extends RiskSnapshotUpsertArgs>(args: SelectSubset<T, RiskSnapshotUpsertArgs<ExtArgs>>): Prisma__RiskSnapshotClient<$Result.GetResult<Prisma.$RiskSnapshotPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of RiskSnapshots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RiskSnapshotCountArgs} args - Arguments to filter RiskSnapshots to count.
     * @example
     * // Count the number of RiskSnapshots
     * const count = await prisma.riskSnapshot.count({
     *   where: {
     *     // ... the filter for the RiskSnapshots we want to count
     *   }
     * })
    **/
    count<T extends RiskSnapshotCountArgs>(
      args?: Subset<T, RiskSnapshotCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RiskSnapshotCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RiskSnapshot.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RiskSnapshotAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RiskSnapshotAggregateArgs>(args: Subset<T, RiskSnapshotAggregateArgs>): Prisma.PrismaPromise<GetRiskSnapshotAggregateType<T>>

    /**
     * Group by RiskSnapshot.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RiskSnapshotGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RiskSnapshotGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RiskSnapshotGroupByArgs['orderBy'] }
        : { orderBy?: RiskSnapshotGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RiskSnapshotGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRiskSnapshotGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RiskSnapshot model
   */
  readonly fields: RiskSnapshotFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RiskSnapshot.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RiskSnapshotClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RiskSnapshot model
   */
  interface RiskSnapshotFieldRefs {
    readonly id: FieldRef<"RiskSnapshot", 'String'>
    readonly dailyPnl: FieldRef<"RiskSnapshot", 'Float'>
    readonly dailyDrawdownPct: FieldRef<"RiskSnapshot", 'Float'>
    readonly maxDrawdownPct: FieldRef<"RiskSnapshot", 'Float'>
    readonly openRiskPct: FieldRef<"RiskSnapshot", 'Float'>
    readonly exposurePct: FieldRef<"RiskSnapshot", 'Float'>
    readonly riskPerTradePct: FieldRef<"RiskSnapshot", 'Float'>
    readonly openPositions: FieldRef<"RiskSnapshot", 'Int'>
    readonly marginLevel: FieldRef<"RiskSnapshot", 'Float'>
    readonly capturedAt: FieldRef<"RiskSnapshot", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RiskSnapshot findUnique
   */
  export type RiskSnapshotFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RiskSnapshot
     */
    select?: RiskSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RiskSnapshot
     */
    omit?: RiskSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which RiskSnapshot to fetch.
     */
    where: RiskSnapshotWhereUniqueInput
  }

  /**
   * RiskSnapshot findUniqueOrThrow
   */
  export type RiskSnapshotFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RiskSnapshot
     */
    select?: RiskSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RiskSnapshot
     */
    omit?: RiskSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which RiskSnapshot to fetch.
     */
    where: RiskSnapshotWhereUniqueInput
  }

  /**
   * RiskSnapshot findFirst
   */
  export type RiskSnapshotFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RiskSnapshot
     */
    select?: RiskSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RiskSnapshot
     */
    omit?: RiskSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which RiskSnapshot to fetch.
     */
    where?: RiskSnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RiskSnapshots to fetch.
     */
    orderBy?: RiskSnapshotOrderByWithRelationInput | RiskSnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RiskSnapshots.
     */
    cursor?: RiskSnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RiskSnapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RiskSnapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RiskSnapshots.
     */
    distinct?: RiskSnapshotScalarFieldEnum | RiskSnapshotScalarFieldEnum[]
  }

  /**
   * RiskSnapshot findFirstOrThrow
   */
  export type RiskSnapshotFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RiskSnapshot
     */
    select?: RiskSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RiskSnapshot
     */
    omit?: RiskSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which RiskSnapshot to fetch.
     */
    where?: RiskSnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RiskSnapshots to fetch.
     */
    orderBy?: RiskSnapshotOrderByWithRelationInput | RiskSnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RiskSnapshots.
     */
    cursor?: RiskSnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RiskSnapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RiskSnapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RiskSnapshots.
     */
    distinct?: RiskSnapshotScalarFieldEnum | RiskSnapshotScalarFieldEnum[]
  }

  /**
   * RiskSnapshot findMany
   */
  export type RiskSnapshotFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RiskSnapshot
     */
    select?: RiskSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RiskSnapshot
     */
    omit?: RiskSnapshotOmit<ExtArgs> | null
    /**
     * Filter, which RiskSnapshots to fetch.
     */
    where?: RiskSnapshotWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RiskSnapshots to fetch.
     */
    orderBy?: RiskSnapshotOrderByWithRelationInput | RiskSnapshotOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RiskSnapshots.
     */
    cursor?: RiskSnapshotWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RiskSnapshots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RiskSnapshots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RiskSnapshots.
     */
    distinct?: RiskSnapshotScalarFieldEnum | RiskSnapshotScalarFieldEnum[]
  }

  /**
   * RiskSnapshot create
   */
  export type RiskSnapshotCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RiskSnapshot
     */
    select?: RiskSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RiskSnapshot
     */
    omit?: RiskSnapshotOmit<ExtArgs> | null
    /**
     * The data needed to create a RiskSnapshot.
     */
    data?: XOR<RiskSnapshotCreateInput, RiskSnapshotUncheckedCreateInput>
  }

  /**
   * RiskSnapshot createMany
   */
  export type RiskSnapshotCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RiskSnapshots.
     */
    data: RiskSnapshotCreateManyInput | RiskSnapshotCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RiskSnapshot createManyAndReturn
   */
  export type RiskSnapshotCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RiskSnapshot
     */
    select?: RiskSnapshotSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RiskSnapshot
     */
    omit?: RiskSnapshotOmit<ExtArgs> | null
    /**
     * The data used to create many RiskSnapshots.
     */
    data: RiskSnapshotCreateManyInput | RiskSnapshotCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RiskSnapshot update
   */
  export type RiskSnapshotUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RiskSnapshot
     */
    select?: RiskSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RiskSnapshot
     */
    omit?: RiskSnapshotOmit<ExtArgs> | null
    /**
     * The data needed to update a RiskSnapshot.
     */
    data: XOR<RiskSnapshotUpdateInput, RiskSnapshotUncheckedUpdateInput>
    /**
     * Choose, which RiskSnapshot to update.
     */
    where: RiskSnapshotWhereUniqueInput
  }

  /**
   * RiskSnapshot updateMany
   */
  export type RiskSnapshotUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RiskSnapshots.
     */
    data: XOR<RiskSnapshotUpdateManyMutationInput, RiskSnapshotUncheckedUpdateManyInput>
    /**
     * Filter which RiskSnapshots to update
     */
    where?: RiskSnapshotWhereInput
    /**
     * Limit how many RiskSnapshots to update.
     */
    limit?: number
  }

  /**
   * RiskSnapshot updateManyAndReturn
   */
  export type RiskSnapshotUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RiskSnapshot
     */
    select?: RiskSnapshotSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the RiskSnapshot
     */
    omit?: RiskSnapshotOmit<ExtArgs> | null
    /**
     * The data used to update RiskSnapshots.
     */
    data: XOR<RiskSnapshotUpdateManyMutationInput, RiskSnapshotUncheckedUpdateManyInput>
    /**
     * Filter which RiskSnapshots to update
     */
    where?: RiskSnapshotWhereInput
    /**
     * Limit how many RiskSnapshots to update.
     */
    limit?: number
  }

  /**
   * RiskSnapshot upsert
   */
  export type RiskSnapshotUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RiskSnapshot
     */
    select?: RiskSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RiskSnapshot
     */
    omit?: RiskSnapshotOmit<ExtArgs> | null
    /**
     * The filter to search for the RiskSnapshot to update in case it exists.
     */
    where: RiskSnapshotWhereUniqueInput
    /**
     * In case the RiskSnapshot found by the `where` argument doesn't exist, create a new RiskSnapshot with this data.
     */
    create: XOR<RiskSnapshotCreateInput, RiskSnapshotUncheckedCreateInput>
    /**
     * In case the RiskSnapshot was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RiskSnapshotUpdateInput, RiskSnapshotUncheckedUpdateInput>
  }

  /**
   * RiskSnapshot delete
   */
  export type RiskSnapshotDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RiskSnapshot
     */
    select?: RiskSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RiskSnapshot
     */
    omit?: RiskSnapshotOmit<ExtArgs> | null
    /**
     * Filter which RiskSnapshot to delete.
     */
    where: RiskSnapshotWhereUniqueInput
  }

  /**
   * RiskSnapshot deleteMany
   */
  export type RiskSnapshotDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RiskSnapshots to delete
     */
    where?: RiskSnapshotWhereInput
    /**
     * Limit how many RiskSnapshots to delete.
     */
    limit?: number
  }

  /**
   * RiskSnapshot without action
   */
  export type RiskSnapshotDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RiskSnapshot
     */
    select?: RiskSnapshotSelect<ExtArgs> | null
    /**
     * Omit specific fields from the RiskSnapshot
     */
    omit?: RiskSnapshotOmit<ExtArgs> | null
  }


  /**
   * Model MarketCandle
   */

  export type AggregateMarketCandle = {
    _count: MarketCandleCountAggregateOutputType | null
    _avg: MarketCandleAvgAggregateOutputType | null
    _sum: MarketCandleSumAggregateOutputType | null
    _min: MarketCandleMinAggregateOutputType | null
    _max: MarketCandleMaxAggregateOutputType | null
  }

  export type MarketCandleAvgAggregateOutputType = {
    open: number | null
    high: number | null
    low: number | null
    close: number | null
    volume: number | null
    spread: number | null
  }

  export type MarketCandleSumAggregateOutputType = {
    open: number | null
    high: number | null
    low: number | null
    close: number | null
    volume: number | null
    spread: number | null
  }

  export type MarketCandleMinAggregateOutputType = {
    id: string | null
    symbol: string | null
    timeframe: string | null
    openTime: Date | null
    open: number | null
    high: number | null
    low: number | null
    close: number | null
    volume: number | null
    spread: number | null
  }

  export type MarketCandleMaxAggregateOutputType = {
    id: string | null
    symbol: string | null
    timeframe: string | null
    openTime: Date | null
    open: number | null
    high: number | null
    low: number | null
    close: number | null
    volume: number | null
    spread: number | null
  }

  export type MarketCandleCountAggregateOutputType = {
    id: number
    symbol: number
    timeframe: number
    openTime: number
    open: number
    high: number
    low: number
    close: number
    volume: number
    spread: number
    _all: number
  }


  export type MarketCandleAvgAggregateInputType = {
    open?: true
    high?: true
    low?: true
    close?: true
    volume?: true
    spread?: true
  }

  export type MarketCandleSumAggregateInputType = {
    open?: true
    high?: true
    low?: true
    close?: true
    volume?: true
    spread?: true
  }

  export type MarketCandleMinAggregateInputType = {
    id?: true
    symbol?: true
    timeframe?: true
    openTime?: true
    open?: true
    high?: true
    low?: true
    close?: true
    volume?: true
    spread?: true
  }

  export type MarketCandleMaxAggregateInputType = {
    id?: true
    symbol?: true
    timeframe?: true
    openTime?: true
    open?: true
    high?: true
    low?: true
    close?: true
    volume?: true
    spread?: true
  }

  export type MarketCandleCountAggregateInputType = {
    id?: true
    symbol?: true
    timeframe?: true
    openTime?: true
    open?: true
    high?: true
    low?: true
    close?: true
    volume?: true
    spread?: true
    _all?: true
  }

  export type MarketCandleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MarketCandle to aggregate.
     */
    where?: MarketCandleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MarketCandles to fetch.
     */
    orderBy?: MarketCandleOrderByWithRelationInput | MarketCandleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MarketCandleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MarketCandles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MarketCandles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MarketCandles
    **/
    _count?: true | MarketCandleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MarketCandleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MarketCandleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MarketCandleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MarketCandleMaxAggregateInputType
  }

  export type GetMarketCandleAggregateType<T extends MarketCandleAggregateArgs> = {
        [P in keyof T & keyof AggregateMarketCandle]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMarketCandle[P]>
      : GetScalarType<T[P], AggregateMarketCandle[P]>
  }




  export type MarketCandleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MarketCandleWhereInput
    orderBy?: MarketCandleOrderByWithAggregationInput | MarketCandleOrderByWithAggregationInput[]
    by: MarketCandleScalarFieldEnum[] | MarketCandleScalarFieldEnum
    having?: MarketCandleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MarketCandleCountAggregateInputType | true
    _avg?: MarketCandleAvgAggregateInputType
    _sum?: MarketCandleSumAggregateInputType
    _min?: MarketCandleMinAggregateInputType
    _max?: MarketCandleMaxAggregateInputType
  }

  export type MarketCandleGroupByOutputType = {
    id: string
    symbol: string
    timeframe: string
    openTime: Date
    open: number
    high: number
    low: number
    close: number
    volume: number
    spread: number | null
    _count: MarketCandleCountAggregateOutputType | null
    _avg: MarketCandleAvgAggregateOutputType | null
    _sum: MarketCandleSumAggregateOutputType | null
    _min: MarketCandleMinAggregateOutputType | null
    _max: MarketCandleMaxAggregateOutputType | null
  }

  type GetMarketCandleGroupByPayload<T extends MarketCandleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MarketCandleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MarketCandleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MarketCandleGroupByOutputType[P]>
            : GetScalarType<T[P], MarketCandleGroupByOutputType[P]>
        }
      >
    >


  export type MarketCandleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    symbol?: boolean
    timeframe?: boolean
    openTime?: boolean
    open?: boolean
    high?: boolean
    low?: boolean
    close?: boolean
    volume?: boolean
    spread?: boolean
  }, ExtArgs["result"]["marketCandle"]>

  export type MarketCandleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    symbol?: boolean
    timeframe?: boolean
    openTime?: boolean
    open?: boolean
    high?: boolean
    low?: boolean
    close?: boolean
    volume?: boolean
    spread?: boolean
  }, ExtArgs["result"]["marketCandle"]>

  export type MarketCandleSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    symbol?: boolean
    timeframe?: boolean
    openTime?: boolean
    open?: boolean
    high?: boolean
    low?: boolean
    close?: boolean
    volume?: boolean
    spread?: boolean
  }, ExtArgs["result"]["marketCandle"]>

  export type MarketCandleSelectScalar = {
    id?: boolean
    symbol?: boolean
    timeframe?: boolean
    openTime?: boolean
    open?: boolean
    high?: boolean
    low?: boolean
    close?: boolean
    volume?: boolean
    spread?: boolean
  }

  export type MarketCandleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "symbol" | "timeframe" | "openTime" | "open" | "high" | "low" | "close" | "volume" | "spread", ExtArgs["result"]["marketCandle"]>

  export type $MarketCandlePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MarketCandle"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      symbol: string
      timeframe: string
      openTime: Date
      open: number
      high: number
      low: number
      close: number
      volume: number
      spread: number | null
    }, ExtArgs["result"]["marketCandle"]>
    composites: {}
  }

  type MarketCandleGetPayload<S extends boolean | null | undefined | MarketCandleDefaultArgs> = $Result.GetResult<Prisma.$MarketCandlePayload, S>

  type MarketCandleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MarketCandleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MarketCandleCountAggregateInputType | true
    }

  export interface MarketCandleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MarketCandle'], meta: { name: 'MarketCandle' } }
    /**
     * Find zero or one MarketCandle that matches the filter.
     * @param {MarketCandleFindUniqueArgs} args - Arguments to find a MarketCandle
     * @example
     * // Get one MarketCandle
     * const marketCandle = await prisma.marketCandle.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MarketCandleFindUniqueArgs>(args: SelectSubset<T, MarketCandleFindUniqueArgs<ExtArgs>>): Prisma__MarketCandleClient<$Result.GetResult<Prisma.$MarketCandlePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MarketCandle that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MarketCandleFindUniqueOrThrowArgs} args - Arguments to find a MarketCandle
     * @example
     * // Get one MarketCandle
     * const marketCandle = await prisma.marketCandle.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MarketCandleFindUniqueOrThrowArgs>(args: SelectSubset<T, MarketCandleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MarketCandleClient<$Result.GetResult<Prisma.$MarketCandlePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MarketCandle that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketCandleFindFirstArgs} args - Arguments to find a MarketCandle
     * @example
     * // Get one MarketCandle
     * const marketCandle = await prisma.marketCandle.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MarketCandleFindFirstArgs>(args?: SelectSubset<T, MarketCandleFindFirstArgs<ExtArgs>>): Prisma__MarketCandleClient<$Result.GetResult<Prisma.$MarketCandlePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MarketCandle that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketCandleFindFirstOrThrowArgs} args - Arguments to find a MarketCandle
     * @example
     * // Get one MarketCandle
     * const marketCandle = await prisma.marketCandle.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MarketCandleFindFirstOrThrowArgs>(args?: SelectSubset<T, MarketCandleFindFirstOrThrowArgs<ExtArgs>>): Prisma__MarketCandleClient<$Result.GetResult<Prisma.$MarketCandlePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MarketCandles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketCandleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MarketCandles
     * const marketCandles = await prisma.marketCandle.findMany()
     * 
     * // Get first 10 MarketCandles
     * const marketCandles = await prisma.marketCandle.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const marketCandleWithIdOnly = await prisma.marketCandle.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MarketCandleFindManyArgs>(args?: SelectSubset<T, MarketCandleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MarketCandlePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MarketCandle.
     * @param {MarketCandleCreateArgs} args - Arguments to create a MarketCandle.
     * @example
     * // Create one MarketCandle
     * const MarketCandle = await prisma.marketCandle.create({
     *   data: {
     *     // ... data to create a MarketCandle
     *   }
     * })
     * 
     */
    create<T extends MarketCandleCreateArgs>(args: SelectSubset<T, MarketCandleCreateArgs<ExtArgs>>): Prisma__MarketCandleClient<$Result.GetResult<Prisma.$MarketCandlePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MarketCandles.
     * @param {MarketCandleCreateManyArgs} args - Arguments to create many MarketCandles.
     * @example
     * // Create many MarketCandles
     * const marketCandle = await prisma.marketCandle.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MarketCandleCreateManyArgs>(args?: SelectSubset<T, MarketCandleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MarketCandles and returns the data saved in the database.
     * @param {MarketCandleCreateManyAndReturnArgs} args - Arguments to create many MarketCandles.
     * @example
     * // Create many MarketCandles
     * const marketCandle = await prisma.marketCandle.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MarketCandles and only return the `id`
     * const marketCandleWithIdOnly = await prisma.marketCandle.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MarketCandleCreateManyAndReturnArgs>(args?: SelectSubset<T, MarketCandleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MarketCandlePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MarketCandle.
     * @param {MarketCandleDeleteArgs} args - Arguments to delete one MarketCandle.
     * @example
     * // Delete one MarketCandle
     * const MarketCandle = await prisma.marketCandle.delete({
     *   where: {
     *     // ... filter to delete one MarketCandle
     *   }
     * })
     * 
     */
    delete<T extends MarketCandleDeleteArgs>(args: SelectSubset<T, MarketCandleDeleteArgs<ExtArgs>>): Prisma__MarketCandleClient<$Result.GetResult<Prisma.$MarketCandlePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MarketCandle.
     * @param {MarketCandleUpdateArgs} args - Arguments to update one MarketCandle.
     * @example
     * // Update one MarketCandle
     * const marketCandle = await prisma.marketCandle.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MarketCandleUpdateArgs>(args: SelectSubset<T, MarketCandleUpdateArgs<ExtArgs>>): Prisma__MarketCandleClient<$Result.GetResult<Prisma.$MarketCandlePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MarketCandles.
     * @param {MarketCandleDeleteManyArgs} args - Arguments to filter MarketCandles to delete.
     * @example
     * // Delete a few MarketCandles
     * const { count } = await prisma.marketCandle.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MarketCandleDeleteManyArgs>(args?: SelectSubset<T, MarketCandleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MarketCandles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketCandleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MarketCandles
     * const marketCandle = await prisma.marketCandle.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MarketCandleUpdateManyArgs>(args: SelectSubset<T, MarketCandleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MarketCandles and returns the data updated in the database.
     * @param {MarketCandleUpdateManyAndReturnArgs} args - Arguments to update many MarketCandles.
     * @example
     * // Update many MarketCandles
     * const marketCandle = await prisma.marketCandle.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MarketCandles and only return the `id`
     * const marketCandleWithIdOnly = await prisma.marketCandle.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MarketCandleUpdateManyAndReturnArgs>(args: SelectSubset<T, MarketCandleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MarketCandlePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MarketCandle.
     * @param {MarketCandleUpsertArgs} args - Arguments to update or create a MarketCandle.
     * @example
     * // Update or create a MarketCandle
     * const marketCandle = await prisma.marketCandle.upsert({
     *   create: {
     *     // ... data to create a MarketCandle
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MarketCandle we want to update
     *   }
     * })
     */
    upsert<T extends MarketCandleUpsertArgs>(args: SelectSubset<T, MarketCandleUpsertArgs<ExtArgs>>): Prisma__MarketCandleClient<$Result.GetResult<Prisma.$MarketCandlePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MarketCandles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketCandleCountArgs} args - Arguments to filter MarketCandles to count.
     * @example
     * // Count the number of MarketCandles
     * const count = await prisma.marketCandle.count({
     *   where: {
     *     // ... the filter for the MarketCandles we want to count
     *   }
     * })
    **/
    count<T extends MarketCandleCountArgs>(
      args?: Subset<T, MarketCandleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MarketCandleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MarketCandle.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketCandleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MarketCandleAggregateArgs>(args: Subset<T, MarketCandleAggregateArgs>): Prisma.PrismaPromise<GetMarketCandleAggregateType<T>>

    /**
     * Group by MarketCandle.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketCandleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MarketCandleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MarketCandleGroupByArgs['orderBy'] }
        : { orderBy?: MarketCandleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MarketCandleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMarketCandleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MarketCandle model
   */
  readonly fields: MarketCandleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MarketCandle.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MarketCandleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MarketCandle model
   */
  interface MarketCandleFieldRefs {
    readonly id: FieldRef<"MarketCandle", 'String'>
    readonly symbol: FieldRef<"MarketCandle", 'String'>
    readonly timeframe: FieldRef<"MarketCandle", 'String'>
    readonly openTime: FieldRef<"MarketCandle", 'DateTime'>
    readonly open: FieldRef<"MarketCandle", 'Float'>
    readonly high: FieldRef<"MarketCandle", 'Float'>
    readonly low: FieldRef<"MarketCandle", 'Float'>
    readonly close: FieldRef<"MarketCandle", 'Float'>
    readonly volume: FieldRef<"MarketCandle", 'Float'>
    readonly spread: FieldRef<"MarketCandle", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * MarketCandle findUnique
   */
  export type MarketCandleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketCandle
     */
    select?: MarketCandleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketCandle
     */
    omit?: MarketCandleOmit<ExtArgs> | null
    /**
     * Filter, which MarketCandle to fetch.
     */
    where: MarketCandleWhereUniqueInput
  }

  /**
   * MarketCandle findUniqueOrThrow
   */
  export type MarketCandleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketCandle
     */
    select?: MarketCandleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketCandle
     */
    omit?: MarketCandleOmit<ExtArgs> | null
    /**
     * Filter, which MarketCandle to fetch.
     */
    where: MarketCandleWhereUniqueInput
  }

  /**
   * MarketCandle findFirst
   */
  export type MarketCandleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketCandle
     */
    select?: MarketCandleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketCandle
     */
    omit?: MarketCandleOmit<ExtArgs> | null
    /**
     * Filter, which MarketCandle to fetch.
     */
    where?: MarketCandleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MarketCandles to fetch.
     */
    orderBy?: MarketCandleOrderByWithRelationInput | MarketCandleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MarketCandles.
     */
    cursor?: MarketCandleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MarketCandles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MarketCandles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MarketCandles.
     */
    distinct?: MarketCandleScalarFieldEnum | MarketCandleScalarFieldEnum[]
  }

  /**
   * MarketCandle findFirstOrThrow
   */
  export type MarketCandleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketCandle
     */
    select?: MarketCandleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketCandle
     */
    omit?: MarketCandleOmit<ExtArgs> | null
    /**
     * Filter, which MarketCandle to fetch.
     */
    where?: MarketCandleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MarketCandles to fetch.
     */
    orderBy?: MarketCandleOrderByWithRelationInput | MarketCandleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MarketCandles.
     */
    cursor?: MarketCandleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MarketCandles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MarketCandles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MarketCandles.
     */
    distinct?: MarketCandleScalarFieldEnum | MarketCandleScalarFieldEnum[]
  }

  /**
   * MarketCandle findMany
   */
  export type MarketCandleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketCandle
     */
    select?: MarketCandleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketCandle
     */
    omit?: MarketCandleOmit<ExtArgs> | null
    /**
     * Filter, which MarketCandles to fetch.
     */
    where?: MarketCandleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MarketCandles to fetch.
     */
    orderBy?: MarketCandleOrderByWithRelationInput | MarketCandleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MarketCandles.
     */
    cursor?: MarketCandleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MarketCandles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MarketCandles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MarketCandles.
     */
    distinct?: MarketCandleScalarFieldEnum | MarketCandleScalarFieldEnum[]
  }

  /**
   * MarketCandle create
   */
  export type MarketCandleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketCandle
     */
    select?: MarketCandleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketCandle
     */
    omit?: MarketCandleOmit<ExtArgs> | null
    /**
     * The data needed to create a MarketCandle.
     */
    data: XOR<MarketCandleCreateInput, MarketCandleUncheckedCreateInput>
  }

  /**
   * MarketCandle createMany
   */
  export type MarketCandleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MarketCandles.
     */
    data: MarketCandleCreateManyInput | MarketCandleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MarketCandle createManyAndReturn
   */
  export type MarketCandleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketCandle
     */
    select?: MarketCandleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MarketCandle
     */
    omit?: MarketCandleOmit<ExtArgs> | null
    /**
     * The data used to create many MarketCandles.
     */
    data: MarketCandleCreateManyInput | MarketCandleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MarketCandle update
   */
  export type MarketCandleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketCandle
     */
    select?: MarketCandleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketCandle
     */
    omit?: MarketCandleOmit<ExtArgs> | null
    /**
     * The data needed to update a MarketCandle.
     */
    data: XOR<MarketCandleUpdateInput, MarketCandleUncheckedUpdateInput>
    /**
     * Choose, which MarketCandle to update.
     */
    where: MarketCandleWhereUniqueInput
  }

  /**
   * MarketCandle updateMany
   */
  export type MarketCandleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MarketCandles.
     */
    data: XOR<MarketCandleUpdateManyMutationInput, MarketCandleUncheckedUpdateManyInput>
    /**
     * Filter which MarketCandles to update
     */
    where?: MarketCandleWhereInput
    /**
     * Limit how many MarketCandles to update.
     */
    limit?: number
  }

  /**
   * MarketCandle updateManyAndReturn
   */
  export type MarketCandleUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketCandle
     */
    select?: MarketCandleSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MarketCandle
     */
    omit?: MarketCandleOmit<ExtArgs> | null
    /**
     * The data used to update MarketCandles.
     */
    data: XOR<MarketCandleUpdateManyMutationInput, MarketCandleUncheckedUpdateManyInput>
    /**
     * Filter which MarketCandles to update
     */
    where?: MarketCandleWhereInput
    /**
     * Limit how many MarketCandles to update.
     */
    limit?: number
  }

  /**
   * MarketCandle upsert
   */
  export type MarketCandleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketCandle
     */
    select?: MarketCandleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketCandle
     */
    omit?: MarketCandleOmit<ExtArgs> | null
    /**
     * The filter to search for the MarketCandle to update in case it exists.
     */
    where: MarketCandleWhereUniqueInput
    /**
     * In case the MarketCandle found by the `where` argument doesn't exist, create a new MarketCandle with this data.
     */
    create: XOR<MarketCandleCreateInput, MarketCandleUncheckedCreateInput>
    /**
     * In case the MarketCandle was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MarketCandleUpdateInput, MarketCandleUncheckedUpdateInput>
  }

  /**
   * MarketCandle delete
   */
  export type MarketCandleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketCandle
     */
    select?: MarketCandleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketCandle
     */
    omit?: MarketCandleOmit<ExtArgs> | null
    /**
     * Filter which MarketCandle to delete.
     */
    where: MarketCandleWhereUniqueInput
  }

  /**
   * MarketCandle deleteMany
   */
  export type MarketCandleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MarketCandles to delete
     */
    where?: MarketCandleWhereInput
    /**
     * Limit how many MarketCandles to delete.
     */
    limit?: number
  }

  /**
   * MarketCandle without action
   */
  export type MarketCandleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketCandle
     */
    select?: MarketCandleSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MarketCandle
     */
    omit?: MarketCandleOmit<ExtArgs> | null
  }


  /**
   * Model LogEntry
   */

  export type AggregateLogEntry = {
    _count: LogEntryCountAggregateOutputType | null
    _min: LogEntryMinAggregateOutputType | null
    _max: LogEntryMaxAggregateOutputType | null
  }

  export type LogEntryMinAggregateOutputType = {
    id: string | null
    level: $Enums.LogLevel | null
    logger: string | null
    message: string | null
    createdAt: Date | null
  }

  export type LogEntryMaxAggregateOutputType = {
    id: string | null
    level: $Enums.LogLevel | null
    logger: string | null
    message: string | null
    createdAt: Date | null
  }

  export type LogEntryCountAggregateOutputType = {
    id: number
    level: number
    logger: number
    message: number
    context: number
    createdAt: number
    _all: number
  }


  export type LogEntryMinAggregateInputType = {
    id?: true
    level?: true
    logger?: true
    message?: true
    createdAt?: true
  }

  export type LogEntryMaxAggregateInputType = {
    id?: true
    level?: true
    logger?: true
    message?: true
    createdAt?: true
  }

  export type LogEntryCountAggregateInputType = {
    id?: true
    level?: true
    logger?: true
    message?: true
    context?: true
    createdAt?: true
    _all?: true
  }

  export type LogEntryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LogEntry to aggregate.
     */
    where?: LogEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LogEntries to fetch.
     */
    orderBy?: LogEntryOrderByWithRelationInput | LogEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LogEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LogEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LogEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LogEntries
    **/
    _count?: true | LogEntryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LogEntryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LogEntryMaxAggregateInputType
  }

  export type GetLogEntryAggregateType<T extends LogEntryAggregateArgs> = {
        [P in keyof T & keyof AggregateLogEntry]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLogEntry[P]>
      : GetScalarType<T[P], AggregateLogEntry[P]>
  }




  export type LogEntryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LogEntryWhereInput
    orderBy?: LogEntryOrderByWithAggregationInput | LogEntryOrderByWithAggregationInput[]
    by: LogEntryScalarFieldEnum[] | LogEntryScalarFieldEnum
    having?: LogEntryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LogEntryCountAggregateInputType | true
    _min?: LogEntryMinAggregateInputType
    _max?: LogEntryMaxAggregateInputType
  }

  export type LogEntryGroupByOutputType = {
    id: string
    level: $Enums.LogLevel
    logger: string | null
    message: string
    context: JsonValue | null
    createdAt: Date
    _count: LogEntryCountAggregateOutputType | null
    _min: LogEntryMinAggregateOutputType | null
    _max: LogEntryMaxAggregateOutputType | null
  }

  type GetLogEntryGroupByPayload<T extends LogEntryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LogEntryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LogEntryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LogEntryGroupByOutputType[P]>
            : GetScalarType<T[P], LogEntryGroupByOutputType[P]>
        }
      >
    >


  export type LogEntrySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    level?: boolean
    logger?: boolean
    message?: boolean
    context?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["logEntry"]>

  export type LogEntrySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    level?: boolean
    logger?: boolean
    message?: boolean
    context?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["logEntry"]>

  export type LogEntrySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    level?: boolean
    logger?: boolean
    message?: boolean
    context?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["logEntry"]>

  export type LogEntrySelectScalar = {
    id?: boolean
    level?: boolean
    logger?: boolean
    message?: boolean
    context?: boolean
    createdAt?: boolean
  }

  export type LogEntryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "level" | "logger" | "message" | "context" | "createdAt", ExtArgs["result"]["logEntry"]>

  export type $LogEntryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LogEntry"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      level: $Enums.LogLevel
      logger: string | null
      message: string
      context: Prisma.JsonValue | null
      createdAt: Date
    }, ExtArgs["result"]["logEntry"]>
    composites: {}
  }

  type LogEntryGetPayload<S extends boolean | null | undefined | LogEntryDefaultArgs> = $Result.GetResult<Prisma.$LogEntryPayload, S>

  type LogEntryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LogEntryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LogEntryCountAggregateInputType | true
    }

  export interface LogEntryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LogEntry'], meta: { name: 'LogEntry' } }
    /**
     * Find zero or one LogEntry that matches the filter.
     * @param {LogEntryFindUniqueArgs} args - Arguments to find a LogEntry
     * @example
     * // Get one LogEntry
     * const logEntry = await prisma.logEntry.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LogEntryFindUniqueArgs>(args: SelectSubset<T, LogEntryFindUniqueArgs<ExtArgs>>): Prisma__LogEntryClient<$Result.GetResult<Prisma.$LogEntryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one LogEntry that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LogEntryFindUniqueOrThrowArgs} args - Arguments to find a LogEntry
     * @example
     * // Get one LogEntry
     * const logEntry = await prisma.logEntry.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LogEntryFindUniqueOrThrowArgs>(args: SelectSubset<T, LogEntryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LogEntryClient<$Result.GetResult<Prisma.$LogEntryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LogEntry that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LogEntryFindFirstArgs} args - Arguments to find a LogEntry
     * @example
     * // Get one LogEntry
     * const logEntry = await prisma.logEntry.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LogEntryFindFirstArgs>(args?: SelectSubset<T, LogEntryFindFirstArgs<ExtArgs>>): Prisma__LogEntryClient<$Result.GetResult<Prisma.$LogEntryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LogEntry that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LogEntryFindFirstOrThrowArgs} args - Arguments to find a LogEntry
     * @example
     * // Get one LogEntry
     * const logEntry = await prisma.logEntry.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LogEntryFindFirstOrThrowArgs>(args?: SelectSubset<T, LogEntryFindFirstOrThrowArgs<ExtArgs>>): Prisma__LogEntryClient<$Result.GetResult<Prisma.$LogEntryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more LogEntries that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LogEntryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LogEntries
     * const logEntries = await prisma.logEntry.findMany()
     * 
     * // Get first 10 LogEntries
     * const logEntries = await prisma.logEntry.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const logEntryWithIdOnly = await prisma.logEntry.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LogEntryFindManyArgs>(args?: SelectSubset<T, LogEntryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LogEntryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a LogEntry.
     * @param {LogEntryCreateArgs} args - Arguments to create a LogEntry.
     * @example
     * // Create one LogEntry
     * const LogEntry = await prisma.logEntry.create({
     *   data: {
     *     // ... data to create a LogEntry
     *   }
     * })
     * 
     */
    create<T extends LogEntryCreateArgs>(args: SelectSubset<T, LogEntryCreateArgs<ExtArgs>>): Prisma__LogEntryClient<$Result.GetResult<Prisma.$LogEntryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many LogEntries.
     * @param {LogEntryCreateManyArgs} args - Arguments to create many LogEntries.
     * @example
     * // Create many LogEntries
     * const logEntry = await prisma.logEntry.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LogEntryCreateManyArgs>(args?: SelectSubset<T, LogEntryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LogEntries and returns the data saved in the database.
     * @param {LogEntryCreateManyAndReturnArgs} args - Arguments to create many LogEntries.
     * @example
     * // Create many LogEntries
     * const logEntry = await prisma.logEntry.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LogEntries and only return the `id`
     * const logEntryWithIdOnly = await prisma.logEntry.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LogEntryCreateManyAndReturnArgs>(args?: SelectSubset<T, LogEntryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LogEntryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a LogEntry.
     * @param {LogEntryDeleteArgs} args - Arguments to delete one LogEntry.
     * @example
     * // Delete one LogEntry
     * const LogEntry = await prisma.logEntry.delete({
     *   where: {
     *     // ... filter to delete one LogEntry
     *   }
     * })
     * 
     */
    delete<T extends LogEntryDeleteArgs>(args: SelectSubset<T, LogEntryDeleteArgs<ExtArgs>>): Prisma__LogEntryClient<$Result.GetResult<Prisma.$LogEntryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one LogEntry.
     * @param {LogEntryUpdateArgs} args - Arguments to update one LogEntry.
     * @example
     * // Update one LogEntry
     * const logEntry = await prisma.logEntry.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LogEntryUpdateArgs>(args: SelectSubset<T, LogEntryUpdateArgs<ExtArgs>>): Prisma__LogEntryClient<$Result.GetResult<Prisma.$LogEntryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more LogEntries.
     * @param {LogEntryDeleteManyArgs} args - Arguments to filter LogEntries to delete.
     * @example
     * // Delete a few LogEntries
     * const { count } = await prisma.logEntry.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LogEntryDeleteManyArgs>(args?: SelectSubset<T, LogEntryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LogEntries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LogEntryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LogEntries
     * const logEntry = await prisma.logEntry.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LogEntryUpdateManyArgs>(args: SelectSubset<T, LogEntryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LogEntries and returns the data updated in the database.
     * @param {LogEntryUpdateManyAndReturnArgs} args - Arguments to update many LogEntries.
     * @example
     * // Update many LogEntries
     * const logEntry = await prisma.logEntry.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more LogEntries and only return the `id`
     * const logEntryWithIdOnly = await prisma.logEntry.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LogEntryUpdateManyAndReturnArgs>(args: SelectSubset<T, LogEntryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LogEntryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one LogEntry.
     * @param {LogEntryUpsertArgs} args - Arguments to update or create a LogEntry.
     * @example
     * // Update or create a LogEntry
     * const logEntry = await prisma.logEntry.upsert({
     *   create: {
     *     // ... data to create a LogEntry
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LogEntry we want to update
     *   }
     * })
     */
    upsert<T extends LogEntryUpsertArgs>(args: SelectSubset<T, LogEntryUpsertArgs<ExtArgs>>): Prisma__LogEntryClient<$Result.GetResult<Prisma.$LogEntryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of LogEntries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LogEntryCountArgs} args - Arguments to filter LogEntries to count.
     * @example
     * // Count the number of LogEntries
     * const count = await prisma.logEntry.count({
     *   where: {
     *     // ... the filter for the LogEntries we want to count
     *   }
     * })
    **/
    count<T extends LogEntryCountArgs>(
      args?: Subset<T, LogEntryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LogEntryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LogEntry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LogEntryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LogEntryAggregateArgs>(args: Subset<T, LogEntryAggregateArgs>): Prisma.PrismaPromise<GetLogEntryAggregateType<T>>

    /**
     * Group by LogEntry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LogEntryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LogEntryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LogEntryGroupByArgs['orderBy'] }
        : { orderBy?: LogEntryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LogEntryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLogEntryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LogEntry model
   */
  readonly fields: LogEntryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LogEntry.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LogEntryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the LogEntry model
   */
  interface LogEntryFieldRefs {
    readonly id: FieldRef<"LogEntry", 'String'>
    readonly level: FieldRef<"LogEntry", 'LogLevel'>
    readonly logger: FieldRef<"LogEntry", 'String'>
    readonly message: FieldRef<"LogEntry", 'String'>
    readonly context: FieldRef<"LogEntry", 'Json'>
    readonly createdAt: FieldRef<"LogEntry", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * LogEntry findUnique
   */
  export type LogEntryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LogEntry
     */
    select?: LogEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LogEntry
     */
    omit?: LogEntryOmit<ExtArgs> | null
    /**
     * Filter, which LogEntry to fetch.
     */
    where: LogEntryWhereUniqueInput
  }

  /**
   * LogEntry findUniqueOrThrow
   */
  export type LogEntryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LogEntry
     */
    select?: LogEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LogEntry
     */
    omit?: LogEntryOmit<ExtArgs> | null
    /**
     * Filter, which LogEntry to fetch.
     */
    where: LogEntryWhereUniqueInput
  }

  /**
   * LogEntry findFirst
   */
  export type LogEntryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LogEntry
     */
    select?: LogEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LogEntry
     */
    omit?: LogEntryOmit<ExtArgs> | null
    /**
     * Filter, which LogEntry to fetch.
     */
    where?: LogEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LogEntries to fetch.
     */
    orderBy?: LogEntryOrderByWithRelationInput | LogEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LogEntries.
     */
    cursor?: LogEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LogEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LogEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LogEntries.
     */
    distinct?: LogEntryScalarFieldEnum | LogEntryScalarFieldEnum[]
  }

  /**
   * LogEntry findFirstOrThrow
   */
  export type LogEntryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LogEntry
     */
    select?: LogEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LogEntry
     */
    omit?: LogEntryOmit<ExtArgs> | null
    /**
     * Filter, which LogEntry to fetch.
     */
    where?: LogEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LogEntries to fetch.
     */
    orderBy?: LogEntryOrderByWithRelationInput | LogEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LogEntries.
     */
    cursor?: LogEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LogEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LogEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LogEntries.
     */
    distinct?: LogEntryScalarFieldEnum | LogEntryScalarFieldEnum[]
  }

  /**
   * LogEntry findMany
   */
  export type LogEntryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LogEntry
     */
    select?: LogEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LogEntry
     */
    omit?: LogEntryOmit<ExtArgs> | null
    /**
     * Filter, which LogEntries to fetch.
     */
    where?: LogEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LogEntries to fetch.
     */
    orderBy?: LogEntryOrderByWithRelationInput | LogEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LogEntries.
     */
    cursor?: LogEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LogEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LogEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LogEntries.
     */
    distinct?: LogEntryScalarFieldEnum | LogEntryScalarFieldEnum[]
  }

  /**
   * LogEntry create
   */
  export type LogEntryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LogEntry
     */
    select?: LogEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LogEntry
     */
    omit?: LogEntryOmit<ExtArgs> | null
    /**
     * The data needed to create a LogEntry.
     */
    data: XOR<LogEntryCreateInput, LogEntryUncheckedCreateInput>
  }

  /**
   * LogEntry createMany
   */
  export type LogEntryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LogEntries.
     */
    data: LogEntryCreateManyInput | LogEntryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LogEntry createManyAndReturn
   */
  export type LogEntryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LogEntry
     */
    select?: LogEntrySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LogEntry
     */
    omit?: LogEntryOmit<ExtArgs> | null
    /**
     * The data used to create many LogEntries.
     */
    data: LogEntryCreateManyInput | LogEntryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LogEntry update
   */
  export type LogEntryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LogEntry
     */
    select?: LogEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LogEntry
     */
    omit?: LogEntryOmit<ExtArgs> | null
    /**
     * The data needed to update a LogEntry.
     */
    data: XOR<LogEntryUpdateInput, LogEntryUncheckedUpdateInput>
    /**
     * Choose, which LogEntry to update.
     */
    where: LogEntryWhereUniqueInput
  }

  /**
   * LogEntry updateMany
   */
  export type LogEntryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LogEntries.
     */
    data: XOR<LogEntryUpdateManyMutationInput, LogEntryUncheckedUpdateManyInput>
    /**
     * Filter which LogEntries to update
     */
    where?: LogEntryWhereInput
    /**
     * Limit how many LogEntries to update.
     */
    limit?: number
  }

  /**
   * LogEntry updateManyAndReturn
   */
  export type LogEntryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LogEntry
     */
    select?: LogEntrySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LogEntry
     */
    omit?: LogEntryOmit<ExtArgs> | null
    /**
     * The data used to update LogEntries.
     */
    data: XOR<LogEntryUpdateManyMutationInput, LogEntryUncheckedUpdateManyInput>
    /**
     * Filter which LogEntries to update
     */
    where?: LogEntryWhereInput
    /**
     * Limit how many LogEntries to update.
     */
    limit?: number
  }

  /**
   * LogEntry upsert
   */
  export type LogEntryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LogEntry
     */
    select?: LogEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LogEntry
     */
    omit?: LogEntryOmit<ExtArgs> | null
    /**
     * The filter to search for the LogEntry to update in case it exists.
     */
    where: LogEntryWhereUniqueInput
    /**
     * In case the LogEntry found by the `where` argument doesn't exist, create a new LogEntry with this data.
     */
    create: XOR<LogEntryCreateInput, LogEntryUncheckedCreateInput>
    /**
     * In case the LogEntry was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LogEntryUpdateInput, LogEntryUncheckedUpdateInput>
  }

  /**
   * LogEntry delete
   */
  export type LogEntryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LogEntry
     */
    select?: LogEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LogEntry
     */
    omit?: LogEntryOmit<ExtArgs> | null
    /**
     * Filter which LogEntry to delete.
     */
    where: LogEntryWhereUniqueInput
  }

  /**
   * LogEntry deleteMany
   */
  export type LogEntryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LogEntries to delete
     */
    where?: LogEntryWhereInput
    /**
     * Limit how many LogEntries to delete.
     */
    limit?: number
  }

  /**
   * LogEntry without action
   */
  export type LogEntryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LogEntry
     */
    select?: LogEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LogEntry
     */
    omit?: LogEntryOmit<ExtArgs> | null
  }


  /**
   * Model JournalEntry
   */

  export type AggregateJournalEntry = {
    _count: JournalEntryCountAggregateOutputType | null
    _min: JournalEntryMinAggregateOutputType | null
    _max: JournalEntryMaxAggregateOutputType | null
  }

  export type JournalEntryMinAggregateOutputType = {
    id: string | null
    entryType: string | null
    symbol: string | null
    title: string | null
    createdAt: Date | null
  }

  export type JournalEntryMaxAggregateOutputType = {
    id: string | null
    entryType: string | null
    symbol: string | null
    title: string | null
    createdAt: Date | null
  }

  export type JournalEntryCountAggregateOutputType = {
    id: number
    entryType: number
    symbol: number
    title: number
    content: number
    createdAt: number
    _all: number
  }


  export type JournalEntryMinAggregateInputType = {
    id?: true
    entryType?: true
    symbol?: true
    title?: true
    createdAt?: true
  }

  export type JournalEntryMaxAggregateInputType = {
    id?: true
    entryType?: true
    symbol?: true
    title?: true
    createdAt?: true
  }

  export type JournalEntryCountAggregateInputType = {
    id?: true
    entryType?: true
    symbol?: true
    title?: true
    content?: true
    createdAt?: true
    _all?: true
  }

  export type JournalEntryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which JournalEntry to aggregate.
     */
    where?: JournalEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JournalEntries to fetch.
     */
    orderBy?: JournalEntryOrderByWithRelationInput | JournalEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: JournalEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JournalEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JournalEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned JournalEntries
    **/
    _count?: true | JournalEntryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: JournalEntryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: JournalEntryMaxAggregateInputType
  }

  export type GetJournalEntryAggregateType<T extends JournalEntryAggregateArgs> = {
        [P in keyof T & keyof AggregateJournalEntry]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateJournalEntry[P]>
      : GetScalarType<T[P], AggregateJournalEntry[P]>
  }




  export type JournalEntryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: JournalEntryWhereInput
    orderBy?: JournalEntryOrderByWithAggregationInput | JournalEntryOrderByWithAggregationInput[]
    by: JournalEntryScalarFieldEnum[] | JournalEntryScalarFieldEnum
    having?: JournalEntryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: JournalEntryCountAggregateInputType | true
    _min?: JournalEntryMinAggregateInputType
    _max?: JournalEntryMaxAggregateInputType
  }

  export type JournalEntryGroupByOutputType = {
    id: string
    entryType: string
    symbol: string | null
    title: string
    content: JsonValue | null
    createdAt: Date
    _count: JournalEntryCountAggregateOutputType | null
    _min: JournalEntryMinAggregateOutputType | null
    _max: JournalEntryMaxAggregateOutputType | null
  }

  type GetJournalEntryGroupByPayload<T extends JournalEntryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<JournalEntryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof JournalEntryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], JournalEntryGroupByOutputType[P]>
            : GetScalarType<T[P], JournalEntryGroupByOutputType[P]>
        }
      >
    >


  export type JournalEntrySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    entryType?: boolean
    symbol?: boolean
    title?: boolean
    content?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["journalEntry"]>

  export type JournalEntrySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    entryType?: boolean
    symbol?: boolean
    title?: boolean
    content?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["journalEntry"]>

  export type JournalEntrySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    entryType?: boolean
    symbol?: boolean
    title?: boolean
    content?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["journalEntry"]>

  export type JournalEntrySelectScalar = {
    id?: boolean
    entryType?: boolean
    symbol?: boolean
    title?: boolean
    content?: boolean
    createdAt?: boolean
  }

  export type JournalEntryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "entryType" | "symbol" | "title" | "content" | "createdAt", ExtArgs["result"]["journalEntry"]>

  export type $JournalEntryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "JournalEntry"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      entryType: string
      symbol: string | null
      title: string
      content: Prisma.JsonValue | null
      createdAt: Date
    }, ExtArgs["result"]["journalEntry"]>
    composites: {}
  }

  type JournalEntryGetPayload<S extends boolean | null | undefined | JournalEntryDefaultArgs> = $Result.GetResult<Prisma.$JournalEntryPayload, S>

  type JournalEntryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<JournalEntryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: JournalEntryCountAggregateInputType | true
    }

  export interface JournalEntryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['JournalEntry'], meta: { name: 'JournalEntry' } }
    /**
     * Find zero or one JournalEntry that matches the filter.
     * @param {JournalEntryFindUniqueArgs} args - Arguments to find a JournalEntry
     * @example
     * // Get one JournalEntry
     * const journalEntry = await prisma.journalEntry.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends JournalEntryFindUniqueArgs>(args: SelectSubset<T, JournalEntryFindUniqueArgs<ExtArgs>>): Prisma__JournalEntryClient<$Result.GetResult<Prisma.$JournalEntryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one JournalEntry that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {JournalEntryFindUniqueOrThrowArgs} args - Arguments to find a JournalEntry
     * @example
     * // Get one JournalEntry
     * const journalEntry = await prisma.journalEntry.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends JournalEntryFindUniqueOrThrowArgs>(args: SelectSubset<T, JournalEntryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__JournalEntryClient<$Result.GetResult<Prisma.$JournalEntryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first JournalEntry that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JournalEntryFindFirstArgs} args - Arguments to find a JournalEntry
     * @example
     * // Get one JournalEntry
     * const journalEntry = await prisma.journalEntry.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends JournalEntryFindFirstArgs>(args?: SelectSubset<T, JournalEntryFindFirstArgs<ExtArgs>>): Prisma__JournalEntryClient<$Result.GetResult<Prisma.$JournalEntryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first JournalEntry that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JournalEntryFindFirstOrThrowArgs} args - Arguments to find a JournalEntry
     * @example
     * // Get one JournalEntry
     * const journalEntry = await prisma.journalEntry.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends JournalEntryFindFirstOrThrowArgs>(args?: SelectSubset<T, JournalEntryFindFirstOrThrowArgs<ExtArgs>>): Prisma__JournalEntryClient<$Result.GetResult<Prisma.$JournalEntryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more JournalEntries that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JournalEntryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all JournalEntries
     * const journalEntries = await prisma.journalEntry.findMany()
     * 
     * // Get first 10 JournalEntries
     * const journalEntries = await prisma.journalEntry.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const journalEntryWithIdOnly = await prisma.journalEntry.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends JournalEntryFindManyArgs>(args?: SelectSubset<T, JournalEntryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JournalEntryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a JournalEntry.
     * @param {JournalEntryCreateArgs} args - Arguments to create a JournalEntry.
     * @example
     * // Create one JournalEntry
     * const JournalEntry = await prisma.journalEntry.create({
     *   data: {
     *     // ... data to create a JournalEntry
     *   }
     * })
     * 
     */
    create<T extends JournalEntryCreateArgs>(args: SelectSubset<T, JournalEntryCreateArgs<ExtArgs>>): Prisma__JournalEntryClient<$Result.GetResult<Prisma.$JournalEntryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many JournalEntries.
     * @param {JournalEntryCreateManyArgs} args - Arguments to create many JournalEntries.
     * @example
     * // Create many JournalEntries
     * const journalEntry = await prisma.journalEntry.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends JournalEntryCreateManyArgs>(args?: SelectSubset<T, JournalEntryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many JournalEntries and returns the data saved in the database.
     * @param {JournalEntryCreateManyAndReturnArgs} args - Arguments to create many JournalEntries.
     * @example
     * // Create many JournalEntries
     * const journalEntry = await prisma.journalEntry.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many JournalEntries and only return the `id`
     * const journalEntryWithIdOnly = await prisma.journalEntry.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends JournalEntryCreateManyAndReturnArgs>(args?: SelectSubset<T, JournalEntryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JournalEntryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a JournalEntry.
     * @param {JournalEntryDeleteArgs} args - Arguments to delete one JournalEntry.
     * @example
     * // Delete one JournalEntry
     * const JournalEntry = await prisma.journalEntry.delete({
     *   where: {
     *     // ... filter to delete one JournalEntry
     *   }
     * })
     * 
     */
    delete<T extends JournalEntryDeleteArgs>(args: SelectSubset<T, JournalEntryDeleteArgs<ExtArgs>>): Prisma__JournalEntryClient<$Result.GetResult<Prisma.$JournalEntryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one JournalEntry.
     * @param {JournalEntryUpdateArgs} args - Arguments to update one JournalEntry.
     * @example
     * // Update one JournalEntry
     * const journalEntry = await prisma.journalEntry.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends JournalEntryUpdateArgs>(args: SelectSubset<T, JournalEntryUpdateArgs<ExtArgs>>): Prisma__JournalEntryClient<$Result.GetResult<Prisma.$JournalEntryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more JournalEntries.
     * @param {JournalEntryDeleteManyArgs} args - Arguments to filter JournalEntries to delete.
     * @example
     * // Delete a few JournalEntries
     * const { count } = await prisma.journalEntry.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends JournalEntryDeleteManyArgs>(args?: SelectSubset<T, JournalEntryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more JournalEntries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JournalEntryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many JournalEntries
     * const journalEntry = await prisma.journalEntry.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends JournalEntryUpdateManyArgs>(args: SelectSubset<T, JournalEntryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more JournalEntries and returns the data updated in the database.
     * @param {JournalEntryUpdateManyAndReturnArgs} args - Arguments to update many JournalEntries.
     * @example
     * // Update many JournalEntries
     * const journalEntry = await prisma.journalEntry.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more JournalEntries and only return the `id`
     * const journalEntryWithIdOnly = await prisma.journalEntry.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends JournalEntryUpdateManyAndReturnArgs>(args: SelectSubset<T, JournalEntryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JournalEntryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one JournalEntry.
     * @param {JournalEntryUpsertArgs} args - Arguments to update or create a JournalEntry.
     * @example
     * // Update or create a JournalEntry
     * const journalEntry = await prisma.journalEntry.upsert({
     *   create: {
     *     // ... data to create a JournalEntry
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the JournalEntry we want to update
     *   }
     * })
     */
    upsert<T extends JournalEntryUpsertArgs>(args: SelectSubset<T, JournalEntryUpsertArgs<ExtArgs>>): Prisma__JournalEntryClient<$Result.GetResult<Prisma.$JournalEntryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of JournalEntries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JournalEntryCountArgs} args - Arguments to filter JournalEntries to count.
     * @example
     * // Count the number of JournalEntries
     * const count = await prisma.journalEntry.count({
     *   where: {
     *     // ... the filter for the JournalEntries we want to count
     *   }
     * })
    **/
    count<T extends JournalEntryCountArgs>(
      args?: Subset<T, JournalEntryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], JournalEntryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a JournalEntry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JournalEntryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends JournalEntryAggregateArgs>(args: Subset<T, JournalEntryAggregateArgs>): Prisma.PrismaPromise<GetJournalEntryAggregateType<T>>

    /**
     * Group by JournalEntry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JournalEntryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends JournalEntryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: JournalEntryGroupByArgs['orderBy'] }
        : { orderBy?: JournalEntryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, JournalEntryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetJournalEntryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the JournalEntry model
   */
  readonly fields: JournalEntryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for JournalEntry.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__JournalEntryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the JournalEntry model
   */
  interface JournalEntryFieldRefs {
    readonly id: FieldRef<"JournalEntry", 'String'>
    readonly entryType: FieldRef<"JournalEntry", 'String'>
    readonly symbol: FieldRef<"JournalEntry", 'String'>
    readonly title: FieldRef<"JournalEntry", 'String'>
    readonly content: FieldRef<"JournalEntry", 'Json'>
    readonly createdAt: FieldRef<"JournalEntry", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * JournalEntry findUnique
   */
  export type JournalEntryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JournalEntry
     */
    select?: JournalEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the JournalEntry
     */
    omit?: JournalEntryOmit<ExtArgs> | null
    /**
     * Filter, which JournalEntry to fetch.
     */
    where: JournalEntryWhereUniqueInput
  }

  /**
   * JournalEntry findUniqueOrThrow
   */
  export type JournalEntryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JournalEntry
     */
    select?: JournalEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the JournalEntry
     */
    omit?: JournalEntryOmit<ExtArgs> | null
    /**
     * Filter, which JournalEntry to fetch.
     */
    where: JournalEntryWhereUniqueInput
  }

  /**
   * JournalEntry findFirst
   */
  export type JournalEntryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JournalEntry
     */
    select?: JournalEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the JournalEntry
     */
    omit?: JournalEntryOmit<ExtArgs> | null
    /**
     * Filter, which JournalEntry to fetch.
     */
    where?: JournalEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JournalEntries to fetch.
     */
    orderBy?: JournalEntryOrderByWithRelationInput | JournalEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for JournalEntries.
     */
    cursor?: JournalEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JournalEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JournalEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of JournalEntries.
     */
    distinct?: JournalEntryScalarFieldEnum | JournalEntryScalarFieldEnum[]
  }

  /**
   * JournalEntry findFirstOrThrow
   */
  export type JournalEntryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JournalEntry
     */
    select?: JournalEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the JournalEntry
     */
    omit?: JournalEntryOmit<ExtArgs> | null
    /**
     * Filter, which JournalEntry to fetch.
     */
    where?: JournalEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JournalEntries to fetch.
     */
    orderBy?: JournalEntryOrderByWithRelationInput | JournalEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for JournalEntries.
     */
    cursor?: JournalEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JournalEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JournalEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of JournalEntries.
     */
    distinct?: JournalEntryScalarFieldEnum | JournalEntryScalarFieldEnum[]
  }

  /**
   * JournalEntry findMany
   */
  export type JournalEntryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JournalEntry
     */
    select?: JournalEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the JournalEntry
     */
    omit?: JournalEntryOmit<ExtArgs> | null
    /**
     * Filter, which JournalEntries to fetch.
     */
    where?: JournalEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JournalEntries to fetch.
     */
    orderBy?: JournalEntryOrderByWithRelationInput | JournalEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing JournalEntries.
     */
    cursor?: JournalEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JournalEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JournalEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of JournalEntries.
     */
    distinct?: JournalEntryScalarFieldEnum | JournalEntryScalarFieldEnum[]
  }

  /**
   * JournalEntry create
   */
  export type JournalEntryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JournalEntry
     */
    select?: JournalEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the JournalEntry
     */
    omit?: JournalEntryOmit<ExtArgs> | null
    /**
     * The data needed to create a JournalEntry.
     */
    data: XOR<JournalEntryCreateInput, JournalEntryUncheckedCreateInput>
  }

  /**
   * JournalEntry createMany
   */
  export type JournalEntryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many JournalEntries.
     */
    data: JournalEntryCreateManyInput | JournalEntryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * JournalEntry createManyAndReturn
   */
  export type JournalEntryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JournalEntry
     */
    select?: JournalEntrySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the JournalEntry
     */
    omit?: JournalEntryOmit<ExtArgs> | null
    /**
     * The data used to create many JournalEntries.
     */
    data: JournalEntryCreateManyInput | JournalEntryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * JournalEntry update
   */
  export type JournalEntryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JournalEntry
     */
    select?: JournalEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the JournalEntry
     */
    omit?: JournalEntryOmit<ExtArgs> | null
    /**
     * The data needed to update a JournalEntry.
     */
    data: XOR<JournalEntryUpdateInput, JournalEntryUncheckedUpdateInput>
    /**
     * Choose, which JournalEntry to update.
     */
    where: JournalEntryWhereUniqueInput
  }

  /**
   * JournalEntry updateMany
   */
  export type JournalEntryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update JournalEntries.
     */
    data: XOR<JournalEntryUpdateManyMutationInput, JournalEntryUncheckedUpdateManyInput>
    /**
     * Filter which JournalEntries to update
     */
    where?: JournalEntryWhereInput
    /**
     * Limit how many JournalEntries to update.
     */
    limit?: number
  }

  /**
   * JournalEntry updateManyAndReturn
   */
  export type JournalEntryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JournalEntry
     */
    select?: JournalEntrySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the JournalEntry
     */
    omit?: JournalEntryOmit<ExtArgs> | null
    /**
     * The data used to update JournalEntries.
     */
    data: XOR<JournalEntryUpdateManyMutationInput, JournalEntryUncheckedUpdateManyInput>
    /**
     * Filter which JournalEntries to update
     */
    where?: JournalEntryWhereInput
    /**
     * Limit how many JournalEntries to update.
     */
    limit?: number
  }

  /**
   * JournalEntry upsert
   */
  export type JournalEntryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JournalEntry
     */
    select?: JournalEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the JournalEntry
     */
    omit?: JournalEntryOmit<ExtArgs> | null
    /**
     * The filter to search for the JournalEntry to update in case it exists.
     */
    where: JournalEntryWhereUniqueInput
    /**
     * In case the JournalEntry found by the `where` argument doesn't exist, create a new JournalEntry with this data.
     */
    create: XOR<JournalEntryCreateInput, JournalEntryUncheckedCreateInput>
    /**
     * In case the JournalEntry was found with the provided `where` argument, update it with this data.
     */
    update: XOR<JournalEntryUpdateInput, JournalEntryUncheckedUpdateInput>
  }

  /**
   * JournalEntry delete
   */
  export type JournalEntryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JournalEntry
     */
    select?: JournalEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the JournalEntry
     */
    omit?: JournalEntryOmit<ExtArgs> | null
    /**
     * Filter which JournalEntry to delete.
     */
    where: JournalEntryWhereUniqueInput
  }

  /**
   * JournalEntry deleteMany
   */
  export type JournalEntryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which JournalEntries to delete
     */
    where?: JournalEntryWhereInput
    /**
     * Limit how many JournalEntries to delete.
     */
    limit?: number
  }

  /**
   * JournalEntry without action
   */
  export type JournalEntryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JournalEntry
     */
    select?: JournalEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the JournalEntry
     */
    omit?: JournalEntryOmit<ExtArgs> | null
  }


  /**
   * Model Notification
   */

  export type AggregateNotification = {
    _count: NotificationCountAggregateOutputType | null
    _min: NotificationMinAggregateOutputType | null
    _max: NotificationMaxAggregateOutputType | null
  }

  export type NotificationMinAggregateOutputType = {
    id: string | null
    channel: string | null
    level: $Enums.LogLevel | null
    title: string | null
    body: string | null
    status: $Enums.NotificationStatus | null
    sentAt: Date | null
    createdAt: Date | null
  }

  export type NotificationMaxAggregateOutputType = {
    id: string | null
    channel: string | null
    level: $Enums.LogLevel | null
    title: string | null
    body: string | null
    status: $Enums.NotificationStatus | null
    sentAt: Date | null
    createdAt: Date | null
  }

  export type NotificationCountAggregateOutputType = {
    id: number
    channel: number
    level: number
    title: number
    body: number
    status: number
    sentAt: number
    createdAt: number
    _all: number
  }


  export type NotificationMinAggregateInputType = {
    id?: true
    channel?: true
    level?: true
    title?: true
    body?: true
    status?: true
    sentAt?: true
    createdAt?: true
  }

  export type NotificationMaxAggregateInputType = {
    id?: true
    channel?: true
    level?: true
    title?: true
    body?: true
    status?: true
    sentAt?: true
    createdAt?: true
  }

  export type NotificationCountAggregateInputType = {
    id?: true
    channel?: true
    level?: true
    title?: true
    body?: true
    status?: true
    sentAt?: true
    createdAt?: true
    _all?: true
  }

  export type NotificationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Notification to aggregate.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Notifications
    **/
    _count?: true | NotificationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NotificationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NotificationMaxAggregateInputType
  }

  export type GetNotificationAggregateType<T extends NotificationAggregateArgs> = {
        [P in keyof T & keyof AggregateNotification]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNotification[P]>
      : GetScalarType<T[P], AggregateNotification[P]>
  }




  export type NotificationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NotificationWhereInput
    orderBy?: NotificationOrderByWithAggregationInput | NotificationOrderByWithAggregationInput[]
    by: NotificationScalarFieldEnum[] | NotificationScalarFieldEnum
    having?: NotificationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NotificationCountAggregateInputType | true
    _min?: NotificationMinAggregateInputType
    _max?: NotificationMaxAggregateInputType
  }

  export type NotificationGroupByOutputType = {
    id: string
    channel: string
    level: $Enums.LogLevel
    title: string
    body: string
    status: $Enums.NotificationStatus
    sentAt: Date | null
    createdAt: Date
    _count: NotificationCountAggregateOutputType | null
    _min: NotificationMinAggregateOutputType | null
    _max: NotificationMaxAggregateOutputType | null
  }

  type GetNotificationGroupByPayload<T extends NotificationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NotificationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NotificationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NotificationGroupByOutputType[P]>
            : GetScalarType<T[P], NotificationGroupByOutputType[P]>
        }
      >
    >


  export type NotificationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    channel?: boolean
    level?: boolean
    title?: boolean
    body?: boolean
    status?: boolean
    sentAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["notification"]>

  export type NotificationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    channel?: boolean
    level?: boolean
    title?: boolean
    body?: boolean
    status?: boolean
    sentAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["notification"]>

  export type NotificationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    channel?: boolean
    level?: boolean
    title?: boolean
    body?: boolean
    status?: boolean
    sentAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["notification"]>

  export type NotificationSelectScalar = {
    id?: boolean
    channel?: boolean
    level?: boolean
    title?: boolean
    body?: boolean
    status?: boolean
    sentAt?: boolean
    createdAt?: boolean
  }

  export type NotificationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "channel" | "level" | "title" | "body" | "status" | "sentAt" | "createdAt", ExtArgs["result"]["notification"]>

  export type $NotificationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Notification"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      channel: string
      level: $Enums.LogLevel
      title: string
      body: string
      status: $Enums.NotificationStatus
      sentAt: Date | null
      createdAt: Date
    }, ExtArgs["result"]["notification"]>
    composites: {}
  }

  type NotificationGetPayload<S extends boolean | null | undefined | NotificationDefaultArgs> = $Result.GetResult<Prisma.$NotificationPayload, S>

  type NotificationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<NotificationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: NotificationCountAggregateInputType | true
    }

  export interface NotificationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Notification'], meta: { name: 'Notification' } }
    /**
     * Find zero or one Notification that matches the filter.
     * @param {NotificationFindUniqueArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NotificationFindUniqueArgs>(args: SelectSubset<T, NotificationFindUniqueArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Notification that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {NotificationFindUniqueOrThrowArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NotificationFindUniqueOrThrowArgs>(args: SelectSubset<T, NotificationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Notification that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindFirstArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NotificationFindFirstArgs>(args?: SelectSubset<T, NotificationFindFirstArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Notification that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindFirstOrThrowArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NotificationFindFirstOrThrowArgs>(args?: SelectSubset<T, NotificationFindFirstOrThrowArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Notifications that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Notifications
     * const notifications = await prisma.notification.findMany()
     * 
     * // Get first 10 Notifications
     * const notifications = await prisma.notification.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const notificationWithIdOnly = await prisma.notification.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends NotificationFindManyArgs>(args?: SelectSubset<T, NotificationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Notification.
     * @param {NotificationCreateArgs} args - Arguments to create a Notification.
     * @example
     * // Create one Notification
     * const Notification = await prisma.notification.create({
     *   data: {
     *     // ... data to create a Notification
     *   }
     * })
     * 
     */
    create<T extends NotificationCreateArgs>(args: SelectSubset<T, NotificationCreateArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Notifications.
     * @param {NotificationCreateManyArgs} args - Arguments to create many Notifications.
     * @example
     * // Create many Notifications
     * const notification = await prisma.notification.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NotificationCreateManyArgs>(args?: SelectSubset<T, NotificationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Notifications and returns the data saved in the database.
     * @param {NotificationCreateManyAndReturnArgs} args - Arguments to create many Notifications.
     * @example
     * // Create many Notifications
     * const notification = await prisma.notification.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Notifications and only return the `id`
     * const notificationWithIdOnly = await prisma.notification.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends NotificationCreateManyAndReturnArgs>(args?: SelectSubset<T, NotificationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Notification.
     * @param {NotificationDeleteArgs} args - Arguments to delete one Notification.
     * @example
     * // Delete one Notification
     * const Notification = await prisma.notification.delete({
     *   where: {
     *     // ... filter to delete one Notification
     *   }
     * })
     * 
     */
    delete<T extends NotificationDeleteArgs>(args: SelectSubset<T, NotificationDeleteArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Notification.
     * @param {NotificationUpdateArgs} args - Arguments to update one Notification.
     * @example
     * // Update one Notification
     * const notification = await prisma.notification.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NotificationUpdateArgs>(args: SelectSubset<T, NotificationUpdateArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Notifications.
     * @param {NotificationDeleteManyArgs} args - Arguments to filter Notifications to delete.
     * @example
     * // Delete a few Notifications
     * const { count } = await prisma.notification.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NotificationDeleteManyArgs>(args?: SelectSubset<T, NotificationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Notifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Notifications
     * const notification = await prisma.notification.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NotificationUpdateManyArgs>(args: SelectSubset<T, NotificationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Notifications and returns the data updated in the database.
     * @param {NotificationUpdateManyAndReturnArgs} args - Arguments to update many Notifications.
     * @example
     * // Update many Notifications
     * const notification = await prisma.notification.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Notifications and only return the `id`
     * const notificationWithIdOnly = await prisma.notification.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends NotificationUpdateManyAndReturnArgs>(args: SelectSubset<T, NotificationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Notification.
     * @param {NotificationUpsertArgs} args - Arguments to update or create a Notification.
     * @example
     * // Update or create a Notification
     * const notification = await prisma.notification.upsert({
     *   create: {
     *     // ... data to create a Notification
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Notification we want to update
     *   }
     * })
     */
    upsert<T extends NotificationUpsertArgs>(args: SelectSubset<T, NotificationUpsertArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Notifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationCountArgs} args - Arguments to filter Notifications to count.
     * @example
     * // Count the number of Notifications
     * const count = await prisma.notification.count({
     *   where: {
     *     // ... the filter for the Notifications we want to count
     *   }
     * })
    **/
    count<T extends NotificationCountArgs>(
      args?: Subset<T, NotificationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NotificationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Notification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends NotificationAggregateArgs>(args: Subset<T, NotificationAggregateArgs>): Prisma.PrismaPromise<GetNotificationAggregateType<T>>

    /**
     * Group by Notification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends NotificationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NotificationGroupByArgs['orderBy'] }
        : { orderBy?: NotificationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, NotificationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNotificationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Notification model
   */
  readonly fields: NotificationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Notification.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NotificationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Notification model
   */
  interface NotificationFieldRefs {
    readonly id: FieldRef<"Notification", 'String'>
    readonly channel: FieldRef<"Notification", 'String'>
    readonly level: FieldRef<"Notification", 'LogLevel'>
    readonly title: FieldRef<"Notification", 'String'>
    readonly body: FieldRef<"Notification", 'String'>
    readonly status: FieldRef<"Notification", 'NotificationStatus'>
    readonly sentAt: FieldRef<"Notification", 'DateTime'>
    readonly createdAt: FieldRef<"Notification", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Notification findUnique
   */
  export type NotificationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification findUniqueOrThrow
   */
  export type NotificationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification findFirst
   */
  export type NotificationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notifications.
     */
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification findFirstOrThrow
   */
  export type NotificationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notifications.
     */
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification findMany
   */
  export type NotificationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Filter, which Notifications to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notifications.
     */
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification create
   */
  export type NotificationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * The data needed to create a Notification.
     */
    data: XOR<NotificationCreateInput, NotificationUncheckedCreateInput>
  }

  /**
   * Notification createMany
   */
  export type NotificationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Notifications.
     */
    data: NotificationCreateManyInput | NotificationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Notification createManyAndReturn
   */
  export type NotificationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * The data used to create many Notifications.
     */
    data: NotificationCreateManyInput | NotificationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Notification update
   */
  export type NotificationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * The data needed to update a Notification.
     */
    data: XOR<NotificationUpdateInput, NotificationUncheckedUpdateInput>
    /**
     * Choose, which Notification to update.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification updateMany
   */
  export type NotificationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Notifications.
     */
    data: XOR<NotificationUpdateManyMutationInput, NotificationUncheckedUpdateManyInput>
    /**
     * Filter which Notifications to update
     */
    where?: NotificationWhereInput
    /**
     * Limit how many Notifications to update.
     */
    limit?: number
  }

  /**
   * Notification updateManyAndReturn
   */
  export type NotificationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * The data used to update Notifications.
     */
    data: XOR<NotificationUpdateManyMutationInput, NotificationUncheckedUpdateManyInput>
    /**
     * Filter which Notifications to update
     */
    where?: NotificationWhereInput
    /**
     * Limit how many Notifications to update.
     */
    limit?: number
  }

  /**
   * Notification upsert
   */
  export type NotificationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * The filter to search for the Notification to update in case it exists.
     */
    where: NotificationWhereUniqueInput
    /**
     * In case the Notification found by the `where` argument doesn't exist, create a new Notification with this data.
     */
    create: XOR<NotificationCreateInput, NotificationUncheckedCreateInput>
    /**
     * In case the Notification was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NotificationUpdateInput, NotificationUncheckedUpdateInput>
  }

  /**
   * Notification delete
   */
  export type NotificationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Filter which Notification to delete.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification deleteMany
   */
  export type NotificationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Notifications to delete
     */
    where?: NotificationWhereInput
    /**
     * Limit how many Notifications to delete.
     */
    limit?: number
  }

  /**
   * Notification without action
   */
  export type NotificationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
  }


  /**
   * Model BotState
   */

  export type AggregateBotState = {
    _count: BotStateCountAggregateOutputType | null
    _avg: BotStateAvgAggregateOutputType | null
    _sum: BotStateSumAggregateOutputType | null
    _min: BotStateMinAggregateOutputType | null
    _max: BotStateMaxAggregateOutputType | null
  }

  export type BotStateAvgAggregateOutputType = {
    maxOpenTrades: number | null
    maxDailyLossPct: number | null
  }

  export type BotStateSumAggregateOutputType = {
    maxOpenTrades: number | null
    maxDailyLossPct: number | null
  }

  export type BotStateMinAggregateOutputType = {
    id: string | null
    mode: $Enums.BotMode | null
    killSwitch: boolean | null
    activeStrategy: string | null
    maxOpenTrades: number | null
    maxDailyLossPct: number | null
    note: string | null
    updatedBy: string | null
    updatedAt: Date | null
    createdAt: Date | null
  }

  export type BotStateMaxAggregateOutputType = {
    id: string | null
    mode: $Enums.BotMode | null
    killSwitch: boolean | null
    activeStrategy: string | null
    maxOpenTrades: number | null
    maxDailyLossPct: number | null
    note: string | null
    updatedBy: string | null
    updatedAt: Date | null
    createdAt: Date | null
  }

  export type BotStateCountAggregateOutputType = {
    id: number
    mode: number
    killSwitch: number
    activeStrategy: number
    maxOpenTrades: number
    maxDailyLossPct: number
    note: number
    updatedBy: number
    updatedAt: number
    createdAt: number
    _all: number
  }


  export type BotStateAvgAggregateInputType = {
    maxOpenTrades?: true
    maxDailyLossPct?: true
  }

  export type BotStateSumAggregateInputType = {
    maxOpenTrades?: true
    maxDailyLossPct?: true
  }

  export type BotStateMinAggregateInputType = {
    id?: true
    mode?: true
    killSwitch?: true
    activeStrategy?: true
    maxOpenTrades?: true
    maxDailyLossPct?: true
    note?: true
    updatedBy?: true
    updatedAt?: true
    createdAt?: true
  }

  export type BotStateMaxAggregateInputType = {
    id?: true
    mode?: true
    killSwitch?: true
    activeStrategy?: true
    maxOpenTrades?: true
    maxDailyLossPct?: true
    note?: true
    updatedBy?: true
    updatedAt?: true
    createdAt?: true
  }

  export type BotStateCountAggregateInputType = {
    id?: true
    mode?: true
    killSwitch?: true
    activeStrategy?: true
    maxOpenTrades?: true
    maxDailyLossPct?: true
    note?: true
    updatedBy?: true
    updatedAt?: true
    createdAt?: true
    _all?: true
  }

  export type BotStateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BotState to aggregate.
     */
    where?: BotStateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BotStates to fetch.
     */
    orderBy?: BotStateOrderByWithRelationInput | BotStateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BotStateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BotStates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BotStates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BotStates
    **/
    _count?: true | BotStateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BotStateAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BotStateSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BotStateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BotStateMaxAggregateInputType
  }

  export type GetBotStateAggregateType<T extends BotStateAggregateArgs> = {
        [P in keyof T & keyof AggregateBotState]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBotState[P]>
      : GetScalarType<T[P], AggregateBotState[P]>
  }




  export type BotStateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BotStateWhereInput
    orderBy?: BotStateOrderByWithAggregationInput | BotStateOrderByWithAggregationInput[]
    by: BotStateScalarFieldEnum[] | BotStateScalarFieldEnum
    having?: BotStateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BotStateCountAggregateInputType | true
    _avg?: BotStateAvgAggregateInputType
    _sum?: BotStateSumAggregateInputType
    _min?: BotStateMinAggregateInputType
    _max?: BotStateMaxAggregateInputType
  }

  export type BotStateGroupByOutputType = {
    id: string
    mode: $Enums.BotMode
    killSwitch: boolean
    activeStrategy: string | null
    maxOpenTrades: number
    maxDailyLossPct: number
    note: string | null
    updatedBy: string | null
    updatedAt: Date
    createdAt: Date
    _count: BotStateCountAggregateOutputType | null
    _avg: BotStateAvgAggregateOutputType | null
    _sum: BotStateSumAggregateOutputType | null
    _min: BotStateMinAggregateOutputType | null
    _max: BotStateMaxAggregateOutputType | null
  }

  type GetBotStateGroupByPayload<T extends BotStateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BotStateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BotStateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BotStateGroupByOutputType[P]>
            : GetScalarType<T[P], BotStateGroupByOutputType[P]>
        }
      >
    >


  export type BotStateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    mode?: boolean
    killSwitch?: boolean
    activeStrategy?: boolean
    maxOpenTrades?: boolean
    maxDailyLossPct?: boolean
    note?: boolean
    updatedBy?: boolean
    updatedAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["botState"]>

  export type BotStateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    mode?: boolean
    killSwitch?: boolean
    activeStrategy?: boolean
    maxOpenTrades?: boolean
    maxDailyLossPct?: boolean
    note?: boolean
    updatedBy?: boolean
    updatedAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["botState"]>

  export type BotStateSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    mode?: boolean
    killSwitch?: boolean
    activeStrategy?: boolean
    maxOpenTrades?: boolean
    maxDailyLossPct?: boolean
    note?: boolean
    updatedBy?: boolean
    updatedAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["botState"]>

  export type BotStateSelectScalar = {
    id?: boolean
    mode?: boolean
    killSwitch?: boolean
    activeStrategy?: boolean
    maxOpenTrades?: boolean
    maxDailyLossPct?: boolean
    note?: boolean
    updatedBy?: boolean
    updatedAt?: boolean
    createdAt?: boolean
  }

  export type BotStateOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "mode" | "killSwitch" | "activeStrategy" | "maxOpenTrades" | "maxDailyLossPct" | "note" | "updatedBy" | "updatedAt" | "createdAt", ExtArgs["result"]["botState"]>

  export type $BotStatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BotState"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      mode: $Enums.BotMode
      killSwitch: boolean
      activeStrategy: string | null
      maxOpenTrades: number
      maxDailyLossPct: number
      note: string | null
      updatedBy: string | null
      updatedAt: Date
      createdAt: Date
    }, ExtArgs["result"]["botState"]>
    composites: {}
  }

  type BotStateGetPayload<S extends boolean | null | undefined | BotStateDefaultArgs> = $Result.GetResult<Prisma.$BotStatePayload, S>

  type BotStateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BotStateFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BotStateCountAggregateInputType | true
    }

  export interface BotStateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BotState'], meta: { name: 'BotState' } }
    /**
     * Find zero or one BotState that matches the filter.
     * @param {BotStateFindUniqueArgs} args - Arguments to find a BotState
     * @example
     * // Get one BotState
     * const botState = await prisma.botState.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BotStateFindUniqueArgs>(args: SelectSubset<T, BotStateFindUniqueArgs<ExtArgs>>): Prisma__BotStateClient<$Result.GetResult<Prisma.$BotStatePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one BotState that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BotStateFindUniqueOrThrowArgs} args - Arguments to find a BotState
     * @example
     * // Get one BotState
     * const botState = await prisma.botState.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BotStateFindUniqueOrThrowArgs>(args: SelectSubset<T, BotStateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BotStateClient<$Result.GetResult<Prisma.$BotStatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BotState that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BotStateFindFirstArgs} args - Arguments to find a BotState
     * @example
     * // Get one BotState
     * const botState = await prisma.botState.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BotStateFindFirstArgs>(args?: SelectSubset<T, BotStateFindFirstArgs<ExtArgs>>): Prisma__BotStateClient<$Result.GetResult<Prisma.$BotStatePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BotState that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BotStateFindFirstOrThrowArgs} args - Arguments to find a BotState
     * @example
     * // Get one BotState
     * const botState = await prisma.botState.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BotStateFindFirstOrThrowArgs>(args?: SelectSubset<T, BotStateFindFirstOrThrowArgs<ExtArgs>>): Prisma__BotStateClient<$Result.GetResult<Prisma.$BotStatePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more BotStates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BotStateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BotStates
     * const botStates = await prisma.botState.findMany()
     * 
     * // Get first 10 BotStates
     * const botStates = await prisma.botState.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const botStateWithIdOnly = await prisma.botState.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BotStateFindManyArgs>(args?: SelectSubset<T, BotStateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BotStatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a BotState.
     * @param {BotStateCreateArgs} args - Arguments to create a BotState.
     * @example
     * // Create one BotState
     * const BotState = await prisma.botState.create({
     *   data: {
     *     // ... data to create a BotState
     *   }
     * })
     * 
     */
    create<T extends BotStateCreateArgs>(args: SelectSubset<T, BotStateCreateArgs<ExtArgs>>): Prisma__BotStateClient<$Result.GetResult<Prisma.$BotStatePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many BotStates.
     * @param {BotStateCreateManyArgs} args - Arguments to create many BotStates.
     * @example
     * // Create many BotStates
     * const botState = await prisma.botState.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BotStateCreateManyArgs>(args?: SelectSubset<T, BotStateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many BotStates and returns the data saved in the database.
     * @param {BotStateCreateManyAndReturnArgs} args - Arguments to create many BotStates.
     * @example
     * // Create many BotStates
     * const botState = await prisma.botState.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many BotStates and only return the `id`
     * const botStateWithIdOnly = await prisma.botState.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BotStateCreateManyAndReturnArgs>(args?: SelectSubset<T, BotStateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BotStatePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a BotState.
     * @param {BotStateDeleteArgs} args - Arguments to delete one BotState.
     * @example
     * // Delete one BotState
     * const BotState = await prisma.botState.delete({
     *   where: {
     *     // ... filter to delete one BotState
     *   }
     * })
     * 
     */
    delete<T extends BotStateDeleteArgs>(args: SelectSubset<T, BotStateDeleteArgs<ExtArgs>>): Prisma__BotStateClient<$Result.GetResult<Prisma.$BotStatePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one BotState.
     * @param {BotStateUpdateArgs} args - Arguments to update one BotState.
     * @example
     * // Update one BotState
     * const botState = await prisma.botState.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BotStateUpdateArgs>(args: SelectSubset<T, BotStateUpdateArgs<ExtArgs>>): Prisma__BotStateClient<$Result.GetResult<Prisma.$BotStatePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more BotStates.
     * @param {BotStateDeleteManyArgs} args - Arguments to filter BotStates to delete.
     * @example
     * // Delete a few BotStates
     * const { count } = await prisma.botState.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BotStateDeleteManyArgs>(args?: SelectSubset<T, BotStateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BotStates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BotStateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BotStates
     * const botState = await prisma.botState.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BotStateUpdateManyArgs>(args: SelectSubset<T, BotStateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BotStates and returns the data updated in the database.
     * @param {BotStateUpdateManyAndReturnArgs} args - Arguments to update many BotStates.
     * @example
     * // Update many BotStates
     * const botState = await prisma.botState.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more BotStates and only return the `id`
     * const botStateWithIdOnly = await prisma.botState.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BotStateUpdateManyAndReturnArgs>(args: SelectSubset<T, BotStateUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BotStatePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one BotState.
     * @param {BotStateUpsertArgs} args - Arguments to update or create a BotState.
     * @example
     * // Update or create a BotState
     * const botState = await prisma.botState.upsert({
     *   create: {
     *     // ... data to create a BotState
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BotState we want to update
     *   }
     * })
     */
    upsert<T extends BotStateUpsertArgs>(args: SelectSubset<T, BotStateUpsertArgs<ExtArgs>>): Prisma__BotStateClient<$Result.GetResult<Prisma.$BotStatePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of BotStates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BotStateCountArgs} args - Arguments to filter BotStates to count.
     * @example
     * // Count the number of BotStates
     * const count = await prisma.botState.count({
     *   where: {
     *     // ... the filter for the BotStates we want to count
     *   }
     * })
    **/
    count<T extends BotStateCountArgs>(
      args?: Subset<T, BotStateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BotStateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BotState.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BotStateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BotStateAggregateArgs>(args: Subset<T, BotStateAggregateArgs>): Prisma.PrismaPromise<GetBotStateAggregateType<T>>

    /**
     * Group by BotState.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BotStateGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BotStateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BotStateGroupByArgs['orderBy'] }
        : { orderBy?: BotStateGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BotStateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBotStateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BotState model
   */
  readonly fields: BotStateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BotState.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BotStateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the BotState model
   */
  interface BotStateFieldRefs {
    readonly id: FieldRef<"BotState", 'String'>
    readonly mode: FieldRef<"BotState", 'BotMode'>
    readonly killSwitch: FieldRef<"BotState", 'Boolean'>
    readonly activeStrategy: FieldRef<"BotState", 'String'>
    readonly maxOpenTrades: FieldRef<"BotState", 'Int'>
    readonly maxDailyLossPct: FieldRef<"BotState", 'Float'>
    readonly note: FieldRef<"BotState", 'String'>
    readonly updatedBy: FieldRef<"BotState", 'String'>
    readonly updatedAt: FieldRef<"BotState", 'DateTime'>
    readonly createdAt: FieldRef<"BotState", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * BotState findUnique
   */
  export type BotStateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotState
     */
    select?: BotStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotState
     */
    omit?: BotStateOmit<ExtArgs> | null
    /**
     * Filter, which BotState to fetch.
     */
    where: BotStateWhereUniqueInput
  }

  /**
   * BotState findUniqueOrThrow
   */
  export type BotStateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotState
     */
    select?: BotStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotState
     */
    omit?: BotStateOmit<ExtArgs> | null
    /**
     * Filter, which BotState to fetch.
     */
    where: BotStateWhereUniqueInput
  }

  /**
   * BotState findFirst
   */
  export type BotStateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotState
     */
    select?: BotStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotState
     */
    omit?: BotStateOmit<ExtArgs> | null
    /**
     * Filter, which BotState to fetch.
     */
    where?: BotStateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BotStates to fetch.
     */
    orderBy?: BotStateOrderByWithRelationInput | BotStateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BotStates.
     */
    cursor?: BotStateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BotStates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BotStates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BotStates.
     */
    distinct?: BotStateScalarFieldEnum | BotStateScalarFieldEnum[]
  }

  /**
   * BotState findFirstOrThrow
   */
  export type BotStateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotState
     */
    select?: BotStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotState
     */
    omit?: BotStateOmit<ExtArgs> | null
    /**
     * Filter, which BotState to fetch.
     */
    where?: BotStateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BotStates to fetch.
     */
    orderBy?: BotStateOrderByWithRelationInput | BotStateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BotStates.
     */
    cursor?: BotStateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BotStates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BotStates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BotStates.
     */
    distinct?: BotStateScalarFieldEnum | BotStateScalarFieldEnum[]
  }

  /**
   * BotState findMany
   */
  export type BotStateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotState
     */
    select?: BotStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotState
     */
    omit?: BotStateOmit<ExtArgs> | null
    /**
     * Filter, which BotStates to fetch.
     */
    where?: BotStateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BotStates to fetch.
     */
    orderBy?: BotStateOrderByWithRelationInput | BotStateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BotStates.
     */
    cursor?: BotStateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BotStates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BotStates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BotStates.
     */
    distinct?: BotStateScalarFieldEnum | BotStateScalarFieldEnum[]
  }

  /**
   * BotState create
   */
  export type BotStateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotState
     */
    select?: BotStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotState
     */
    omit?: BotStateOmit<ExtArgs> | null
    /**
     * The data needed to create a BotState.
     */
    data: XOR<BotStateCreateInput, BotStateUncheckedCreateInput>
  }

  /**
   * BotState createMany
   */
  export type BotStateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BotStates.
     */
    data: BotStateCreateManyInput | BotStateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BotState createManyAndReturn
   */
  export type BotStateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotState
     */
    select?: BotStateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BotState
     */
    omit?: BotStateOmit<ExtArgs> | null
    /**
     * The data used to create many BotStates.
     */
    data: BotStateCreateManyInput | BotStateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BotState update
   */
  export type BotStateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotState
     */
    select?: BotStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotState
     */
    omit?: BotStateOmit<ExtArgs> | null
    /**
     * The data needed to update a BotState.
     */
    data: XOR<BotStateUpdateInput, BotStateUncheckedUpdateInput>
    /**
     * Choose, which BotState to update.
     */
    where: BotStateWhereUniqueInput
  }

  /**
   * BotState updateMany
   */
  export type BotStateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BotStates.
     */
    data: XOR<BotStateUpdateManyMutationInput, BotStateUncheckedUpdateManyInput>
    /**
     * Filter which BotStates to update
     */
    where?: BotStateWhereInput
    /**
     * Limit how many BotStates to update.
     */
    limit?: number
  }

  /**
   * BotState updateManyAndReturn
   */
  export type BotStateUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotState
     */
    select?: BotStateSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BotState
     */
    omit?: BotStateOmit<ExtArgs> | null
    /**
     * The data used to update BotStates.
     */
    data: XOR<BotStateUpdateManyMutationInput, BotStateUncheckedUpdateManyInput>
    /**
     * Filter which BotStates to update
     */
    where?: BotStateWhereInput
    /**
     * Limit how many BotStates to update.
     */
    limit?: number
  }

  /**
   * BotState upsert
   */
  export type BotStateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotState
     */
    select?: BotStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotState
     */
    omit?: BotStateOmit<ExtArgs> | null
    /**
     * The filter to search for the BotState to update in case it exists.
     */
    where: BotStateWhereUniqueInput
    /**
     * In case the BotState found by the `where` argument doesn't exist, create a new BotState with this data.
     */
    create: XOR<BotStateCreateInput, BotStateUncheckedCreateInput>
    /**
     * In case the BotState was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BotStateUpdateInput, BotStateUncheckedUpdateInput>
  }

  /**
   * BotState delete
   */
  export type BotStateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotState
     */
    select?: BotStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotState
     */
    omit?: BotStateOmit<ExtArgs> | null
    /**
     * Filter which BotState to delete.
     */
    where: BotStateWhereUniqueInput
  }

  /**
   * BotState deleteMany
   */
  export type BotStateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BotStates to delete
     */
    where?: BotStateWhereInput
    /**
     * Limit how many BotStates to delete.
     */
    limit?: number
  }

  /**
   * BotState without action
   */
  export type BotStateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotState
     */
    select?: BotStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotState
     */
    omit?: BotStateOmit<ExtArgs> | null
  }


  /**
   * Model SessionWindow
   */

  export type AggregateSessionWindow = {
    _count: SessionWindowCountAggregateOutputType | null
    _avg: SessionWindowAvgAggregateOutputType | null
    _sum: SessionWindowSumAggregateOutputType | null
    _min: SessionWindowMinAggregateOutputType | null
    _max: SessionWindowMaxAggregateOutputType | null
  }

  export type SessionWindowAvgAggregateOutputType = {
    startMinuteUtc: number | null
    endMinuteUtc: number | null
  }

  export type SessionWindowSumAggregateOutputType = {
    startMinuteUtc: number | null
    endMinuteUtc: number | null
  }

  export type SessionWindowMinAggregateOutputType = {
    id: string | null
    sessionName: string | null
    startMinuteUtc: number | null
    endMinuteUtc: number | null
    enabled: boolean | null
    tradingEnabled: boolean | null
    note: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SessionWindowMaxAggregateOutputType = {
    id: string | null
    sessionName: string | null
    startMinuteUtc: number | null
    endMinuteUtc: number | null
    enabled: boolean | null
    tradingEnabled: boolean | null
    note: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SessionWindowCountAggregateOutputType = {
    id: number
    sessionName: number
    startMinuteUtc: number
    endMinuteUtc: number
    enabled: number
    tradingEnabled: number
    symbols: number
    note: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SessionWindowAvgAggregateInputType = {
    startMinuteUtc?: true
    endMinuteUtc?: true
  }

  export type SessionWindowSumAggregateInputType = {
    startMinuteUtc?: true
    endMinuteUtc?: true
  }

  export type SessionWindowMinAggregateInputType = {
    id?: true
    sessionName?: true
    startMinuteUtc?: true
    endMinuteUtc?: true
    enabled?: true
    tradingEnabled?: true
    note?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SessionWindowMaxAggregateInputType = {
    id?: true
    sessionName?: true
    startMinuteUtc?: true
    endMinuteUtc?: true
    enabled?: true
    tradingEnabled?: true
    note?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SessionWindowCountAggregateInputType = {
    id?: true
    sessionName?: true
    startMinuteUtc?: true
    endMinuteUtc?: true
    enabled?: true
    tradingEnabled?: true
    symbols?: true
    note?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SessionWindowAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SessionWindow to aggregate.
     */
    where?: SessionWindowWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SessionWindows to fetch.
     */
    orderBy?: SessionWindowOrderByWithRelationInput | SessionWindowOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SessionWindowWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SessionWindows from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SessionWindows.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SessionWindows
    **/
    _count?: true | SessionWindowCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SessionWindowAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SessionWindowSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SessionWindowMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SessionWindowMaxAggregateInputType
  }

  export type GetSessionWindowAggregateType<T extends SessionWindowAggregateArgs> = {
        [P in keyof T & keyof AggregateSessionWindow]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSessionWindow[P]>
      : GetScalarType<T[P], AggregateSessionWindow[P]>
  }




  export type SessionWindowGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SessionWindowWhereInput
    orderBy?: SessionWindowOrderByWithAggregationInput | SessionWindowOrderByWithAggregationInput[]
    by: SessionWindowScalarFieldEnum[] | SessionWindowScalarFieldEnum
    having?: SessionWindowScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SessionWindowCountAggregateInputType | true
    _avg?: SessionWindowAvgAggregateInputType
    _sum?: SessionWindowSumAggregateInputType
    _min?: SessionWindowMinAggregateInputType
    _max?: SessionWindowMaxAggregateInputType
  }

  export type SessionWindowGroupByOutputType = {
    id: string
    sessionName: string
    startMinuteUtc: number
    endMinuteUtc: number
    enabled: boolean
    tradingEnabled: boolean
    symbols: string[]
    note: string | null
    createdAt: Date
    updatedAt: Date
    _count: SessionWindowCountAggregateOutputType | null
    _avg: SessionWindowAvgAggregateOutputType | null
    _sum: SessionWindowSumAggregateOutputType | null
    _min: SessionWindowMinAggregateOutputType | null
    _max: SessionWindowMaxAggregateOutputType | null
  }

  type GetSessionWindowGroupByPayload<T extends SessionWindowGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SessionWindowGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SessionWindowGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SessionWindowGroupByOutputType[P]>
            : GetScalarType<T[P], SessionWindowGroupByOutputType[P]>
        }
      >
    >


  export type SessionWindowSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionName?: boolean
    startMinuteUtc?: boolean
    endMinuteUtc?: boolean
    enabled?: boolean
    tradingEnabled?: boolean
    symbols?: boolean
    note?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    decisions?: boolean | SessionWindow$decisionsArgs<ExtArgs>
    _count?: boolean | SessionWindowCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sessionWindow"]>

  export type SessionWindowSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionName?: boolean
    startMinuteUtc?: boolean
    endMinuteUtc?: boolean
    enabled?: boolean
    tradingEnabled?: boolean
    symbols?: boolean
    note?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["sessionWindow"]>

  export type SessionWindowSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionName?: boolean
    startMinuteUtc?: boolean
    endMinuteUtc?: boolean
    enabled?: boolean
    tradingEnabled?: boolean
    symbols?: boolean
    note?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["sessionWindow"]>

  export type SessionWindowSelectScalar = {
    id?: boolean
    sessionName?: boolean
    startMinuteUtc?: boolean
    endMinuteUtc?: boolean
    enabled?: boolean
    tradingEnabled?: boolean
    symbols?: boolean
    note?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SessionWindowOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "sessionName" | "startMinuteUtc" | "endMinuteUtc" | "enabled" | "tradingEnabled" | "symbols" | "note" | "createdAt" | "updatedAt", ExtArgs["result"]["sessionWindow"]>
  export type SessionWindowInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    decisions?: boolean | SessionWindow$decisionsArgs<ExtArgs>
    _count?: boolean | SessionWindowCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SessionWindowIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type SessionWindowIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $SessionWindowPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SessionWindow"
    objects: {
      decisions: Prisma.$DecisionLogPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sessionName: string
      startMinuteUtc: number
      endMinuteUtc: number
      enabled: boolean
      tradingEnabled: boolean
      symbols: string[]
      note: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["sessionWindow"]>
    composites: {}
  }

  type SessionWindowGetPayload<S extends boolean | null | undefined | SessionWindowDefaultArgs> = $Result.GetResult<Prisma.$SessionWindowPayload, S>

  type SessionWindowCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SessionWindowFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SessionWindowCountAggregateInputType | true
    }

  export interface SessionWindowDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SessionWindow'], meta: { name: 'SessionWindow' } }
    /**
     * Find zero or one SessionWindow that matches the filter.
     * @param {SessionWindowFindUniqueArgs} args - Arguments to find a SessionWindow
     * @example
     * // Get one SessionWindow
     * const sessionWindow = await prisma.sessionWindow.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SessionWindowFindUniqueArgs>(args: SelectSubset<T, SessionWindowFindUniqueArgs<ExtArgs>>): Prisma__SessionWindowClient<$Result.GetResult<Prisma.$SessionWindowPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SessionWindow that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SessionWindowFindUniqueOrThrowArgs} args - Arguments to find a SessionWindow
     * @example
     * // Get one SessionWindow
     * const sessionWindow = await prisma.sessionWindow.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SessionWindowFindUniqueOrThrowArgs>(args: SelectSubset<T, SessionWindowFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SessionWindowClient<$Result.GetResult<Prisma.$SessionWindowPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SessionWindow that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionWindowFindFirstArgs} args - Arguments to find a SessionWindow
     * @example
     * // Get one SessionWindow
     * const sessionWindow = await prisma.sessionWindow.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SessionWindowFindFirstArgs>(args?: SelectSubset<T, SessionWindowFindFirstArgs<ExtArgs>>): Prisma__SessionWindowClient<$Result.GetResult<Prisma.$SessionWindowPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SessionWindow that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionWindowFindFirstOrThrowArgs} args - Arguments to find a SessionWindow
     * @example
     * // Get one SessionWindow
     * const sessionWindow = await prisma.sessionWindow.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SessionWindowFindFirstOrThrowArgs>(args?: SelectSubset<T, SessionWindowFindFirstOrThrowArgs<ExtArgs>>): Prisma__SessionWindowClient<$Result.GetResult<Prisma.$SessionWindowPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SessionWindows that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionWindowFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SessionWindows
     * const sessionWindows = await prisma.sessionWindow.findMany()
     * 
     * // Get first 10 SessionWindows
     * const sessionWindows = await prisma.sessionWindow.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sessionWindowWithIdOnly = await prisma.sessionWindow.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SessionWindowFindManyArgs>(args?: SelectSubset<T, SessionWindowFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionWindowPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SessionWindow.
     * @param {SessionWindowCreateArgs} args - Arguments to create a SessionWindow.
     * @example
     * // Create one SessionWindow
     * const SessionWindow = await prisma.sessionWindow.create({
     *   data: {
     *     // ... data to create a SessionWindow
     *   }
     * })
     * 
     */
    create<T extends SessionWindowCreateArgs>(args: SelectSubset<T, SessionWindowCreateArgs<ExtArgs>>): Prisma__SessionWindowClient<$Result.GetResult<Prisma.$SessionWindowPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SessionWindows.
     * @param {SessionWindowCreateManyArgs} args - Arguments to create many SessionWindows.
     * @example
     * // Create many SessionWindows
     * const sessionWindow = await prisma.sessionWindow.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SessionWindowCreateManyArgs>(args?: SelectSubset<T, SessionWindowCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SessionWindows and returns the data saved in the database.
     * @param {SessionWindowCreateManyAndReturnArgs} args - Arguments to create many SessionWindows.
     * @example
     * // Create many SessionWindows
     * const sessionWindow = await prisma.sessionWindow.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SessionWindows and only return the `id`
     * const sessionWindowWithIdOnly = await prisma.sessionWindow.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SessionWindowCreateManyAndReturnArgs>(args?: SelectSubset<T, SessionWindowCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionWindowPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SessionWindow.
     * @param {SessionWindowDeleteArgs} args - Arguments to delete one SessionWindow.
     * @example
     * // Delete one SessionWindow
     * const SessionWindow = await prisma.sessionWindow.delete({
     *   where: {
     *     // ... filter to delete one SessionWindow
     *   }
     * })
     * 
     */
    delete<T extends SessionWindowDeleteArgs>(args: SelectSubset<T, SessionWindowDeleteArgs<ExtArgs>>): Prisma__SessionWindowClient<$Result.GetResult<Prisma.$SessionWindowPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SessionWindow.
     * @param {SessionWindowUpdateArgs} args - Arguments to update one SessionWindow.
     * @example
     * // Update one SessionWindow
     * const sessionWindow = await prisma.sessionWindow.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SessionWindowUpdateArgs>(args: SelectSubset<T, SessionWindowUpdateArgs<ExtArgs>>): Prisma__SessionWindowClient<$Result.GetResult<Prisma.$SessionWindowPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SessionWindows.
     * @param {SessionWindowDeleteManyArgs} args - Arguments to filter SessionWindows to delete.
     * @example
     * // Delete a few SessionWindows
     * const { count } = await prisma.sessionWindow.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SessionWindowDeleteManyArgs>(args?: SelectSubset<T, SessionWindowDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SessionWindows.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionWindowUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SessionWindows
     * const sessionWindow = await prisma.sessionWindow.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SessionWindowUpdateManyArgs>(args: SelectSubset<T, SessionWindowUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SessionWindows and returns the data updated in the database.
     * @param {SessionWindowUpdateManyAndReturnArgs} args - Arguments to update many SessionWindows.
     * @example
     * // Update many SessionWindows
     * const sessionWindow = await prisma.sessionWindow.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SessionWindows and only return the `id`
     * const sessionWindowWithIdOnly = await prisma.sessionWindow.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SessionWindowUpdateManyAndReturnArgs>(args: SelectSubset<T, SessionWindowUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionWindowPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SessionWindow.
     * @param {SessionWindowUpsertArgs} args - Arguments to update or create a SessionWindow.
     * @example
     * // Update or create a SessionWindow
     * const sessionWindow = await prisma.sessionWindow.upsert({
     *   create: {
     *     // ... data to create a SessionWindow
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SessionWindow we want to update
     *   }
     * })
     */
    upsert<T extends SessionWindowUpsertArgs>(args: SelectSubset<T, SessionWindowUpsertArgs<ExtArgs>>): Prisma__SessionWindowClient<$Result.GetResult<Prisma.$SessionWindowPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SessionWindows.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionWindowCountArgs} args - Arguments to filter SessionWindows to count.
     * @example
     * // Count the number of SessionWindows
     * const count = await prisma.sessionWindow.count({
     *   where: {
     *     // ... the filter for the SessionWindows we want to count
     *   }
     * })
    **/
    count<T extends SessionWindowCountArgs>(
      args?: Subset<T, SessionWindowCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SessionWindowCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SessionWindow.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionWindowAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SessionWindowAggregateArgs>(args: Subset<T, SessionWindowAggregateArgs>): Prisma.PrismaPromise<GetSessionWindowAggregateType<T>>

    /**
     * Group by SessionWindow.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionWindowGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SessionWindowGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SessionWindowGroupByArgs['orderBy'] }
        : { orderBy?: SessionWindowGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SessionWindowGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSessionWindowGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SessionWindow model
   */
  readonly fields: SessionWindowFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SessionWindow.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SessionWindowClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    decisions<T extends SessionWindow$decisionsArgs<ExtArgs> = {}>(args?: Subset<T, SessionWindow$decisionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DecisionLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SessionWindow model
   */
  interface SessionWindowFieldRefs {
    readonly id: FieldRef<"SessionWindow", 'String'>
    readonly sessionName: FieldRef<"SessionWindow", 'String'>
    readonly startMinuteUtc: FieldRef<"SessionWindow", 'Int'>
    readonly endMinuteUtc: FieldRef<"SessionWindow", 'Int'>
    readonly enabled: FieldRef<"SessionWindow", 'Boolean'>
    readonly tradingEnabled: FieldRef<"SessionWindow", 'Boolean'>
    readonly symbols: FieldRef<"SessionWindow", 'String[]'>
    readonly note: FieldRef<"SessionWindow", 'String'>
    readonly createdAt: FieldRef<"SessionWindow", 'DateTime'>
    readonly updatedAt: FieldRef<"SessionWindow", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SessionWindow findUnique
   */
  export type SessionWindowFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SessionWindow
     */
    select?: SessionWindowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SessionWindow
     */
    omit?: SessionWindowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionWindowInclude<ExtArgs> | null
    /**
     * Filter, which SessionWindow to fetch.
     */
    where: SessionWindowWhereUniqueInput
  }

  /**
   * SessionWindow findUniqueOrThrow
   */
  export type SessionWindowFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SessionWindow
     */
    select?: SessionWindowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SessionWindow
     */
    omit?: SessionWindowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionWindowInclude<ExtArgs> | null
    /**
     * Filter, which SessionWindow to fetch.
     */
    where: SessionWindowWhereUniqueInput
  }

  /**
   * SessionWindow findFirst
   */
  export type SessionWindowFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SessionWindow
     */
    select?: SessionWindowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SessionWindow
     */
    omit?: SessionWindowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionWindowInclude<ExtArgs> | null
    /**
     * Filter, which SessionWindow to fetch.
     */
    where?: SessionWindowWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SessionWindows to fetch.
     */
    orderBy?: SessionWindowOrderByWithRelationInput | SessionWindowOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SessionWindows.
     */
    cursor?: SessionWindowWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SessionWindows from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SessionWindows.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SessionWindows.
     */
    distinct?: SessionWindowScalarFieldEnum | SessionWindowScalarFieldEnum[]
  }

  /**
   * SessionWindow findFirstOrThrow
   */
  export type SessionWindowFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SessionWindow
     */
    select?: SessionWindowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SessionWindow
     */
    omit?: SessionWindowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionWindowInclude<ExtArgs> | null
    /**
     * Filter, which SessionWindow to fetch.
     */
    where?: SessionWindowWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SessionWindows to fetch.
     */
    orderBy?: SessionWindowOrderByWithRelationInput | SessionWindowOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SessionWindows.
     */
    cursor?: SessionWindowWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SessionWindows from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SessionWindows.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SessionWindows.
     */
    distinct?: SessionWindowScalarFieldEnum | SessionWindowScalarFieldEnum[]
  }

  /**
   * SessionWindow findMany
   */
  export type SessionWindowFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SessionWindow
     */
    select?: SessionWindowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SessionWindow
     */
    omit?: SessionWindowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionWindowInclude<ExtArgs> | null
    /**
     * Filter, which SessionWindows to fetch.
     */
    where?: SessionWindowWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SessionWindows to fetch.
     */
    orderBy?: SessionWindowOrderByWithRelationInput | SessionWindowOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SessionWindows.
     */
    cursor?: SessionWindowWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SessionWindows from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SessionWindows.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SessionWindows.
     */
    distinct?: SessionWindowScalarFieldEnum | SessionWindowScalarFieldEnum[]
  }

  /**
   * SessionWindow create
   */
  export type SessionWindowCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SessionWindow
     */
    select?: SessionWindowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SessionWindow
     */
    omit?: SessionWindowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionWindowInclude<ExtArgs> | null
    /**
     * The data needed to create a SessionWindow.
     */
    data: XOR<SessionWindowCreateInput, SessionWindowUncheckedCreateInput>
  }

  /**
   * SessionWindow createMany
   */
  export type SessionWindowCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SessionWindows.
     */
    data: SessionWindowCreateManyInput | SessionWindowCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SessionWindow createManyAndReturn
   */
  export type SessionWindowCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SessionWindow
     */
    select?: SessionWindowSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SessionWindow
     */
    omit?: SessionWindowOmit<ExtArgs> | null
    /**
     * The data used to create many SessionWindows.
     */
    data: SessionWindowCreateManyInput | SessionWindowCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SessionWindow update
   */
  export type SessionWindowUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SessionWindow
     */
    select?: SessionWindowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SessionWindow
     */
    omit?: SessionWindowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionWindowInclude<ExtArgs> | null
    /**
     * The data needed to update a SessionWindow.
     */
    data: XOR<SessionWindowUpdateInput, SessionWindowUncheckedUpdateInput>
    /**
     * Choose, which SessionWindow to update.
     */
    where: SessionWindowWhereUniqueInput
  }

  /**
   * SessionWindow updateMany
   */
  export type SessionWindowUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SessionWindows.
     */
    data: XOR<SessionWindowUpdateManyMutationInput, SessionWindowUncheckedUpdateManyInput>
    /**
     * Filter which SessionWindows to update
     */
    where?: SessionWindowWhereInput
    /**
     * Limit how many SessionWindows to update.
     */
    limit?: number
  }

  /**
   * SessionWindow updateManyAndReturn
   */
  export type SessionWindowUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SessionWindow
     */
    select?: SessionWindowSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SessionWindow
     */
    omit?: SessionWindowOmit<ExtArgs> | null
    /**
     * The data used to update SessionWindows.
     */
    data: XOR<SessionWindowUpdateManyMutationInput, SessionWindowUncheckedUpdateManyInput>
    /**
     * Filter which SessionWindows to update
     */
    where?: SessionWindowWhereInput
    /**
     * Limit how many SessionWindows to update.
     */
    limit?: number
  }

  /**
   * SessionWindow upsert
   */
  export type SessionWindowUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SessionWindow
     */
    select?: SessionWindowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SessionWindow
     */
    omit?: SessionWindowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionWindowInclude<ExtArgs> | null
    /**
     * The filter to search for the SessionWindow to update in case it exists.
     */
    where: SessionWindowWhereUniqueInput
    /**
     * In case the SessionWindow found by the `where` argument doesn't exist, create a new SessionWindow with this data.
     */
    create: XOR<SessionWindowCreateInput, SessionWindowUncheckedCreateInput>
    /**
     * In case the SessionWindow was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SessionWindowUpdateInput, SessionWindowUncheckedUpdateInput>
  }

  /**
   * SessionWindow delete
   */
  export type SessionWindowDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SessionWindow
     */
    select?: SessionWindowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SessionWindow
     */
    omit?: SessionWindowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionWindowInclude<ExtArgs> | null
    /**
     * Filter which SessionWindow to delete.
     */
    where: SessionWindowWhereUniqueInput
  }

  /**
   * SessionWindow deleteMany
   */
  export type SessionWindowDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SessionWindows to delete
     */
    where?: SessionWindowWhereInput
    /**
     * Limit how many SessionWindows to delete.
     */
    limit?: number
  }

  /**
   * SessionWindow.decisions
   */
  export type SessionWindow$decisionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionLog
     */
    select?: DecisionLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DecisionLog
     */
    omit?: DecisionLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DecisionLogInclude<ExtArgs> | null
    where?: DecisionLogWhereInput
    orderBy?: DecisionLogOrderByWithRelationInput | DecisionLogOrderByWithRelationInput[]
    cursor?: DecisionLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DecisionLogScalarFieldEnum | DecisionLogScalarFieldEnum[]
  }

  /**
   * SessionWindow without action
   */
  export type SessionWindowDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SessionWindow
     */
    select?: SessionWindowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SessionWindow
     */
    omit?: SessionWindowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionWindowInclude<ExtArgs> | null
  }


  /**
   * Model DecisionLog
   */

  export type AggregateDecisionLog = {
    _count: DecisionLogCountAggregateOutputType | null
    _avg: DecisionLogAvgAggregateOutputType | null
    _sum: DecisionLogSumAggregateOutputType | null
    _min: DecisionLogMinAggregateOutputType | null
    _max: DecisionLogMaxAggregateOutputType | null
  }

  export type DecisionLogAvgAggregateOutputType = {
    confidenceScore: number | null
    proposedSl: number | null
    proposedTp: number | null
    proposedVolume: number | null
    latencyMs: number | null
  }

  export type DecisionLogSumAggregateOutputType = {
    confidenceScore: number | null
    proposedSl: number | null
    proposedTp: number | null
    proposedVolume: number | null
    latencyMs: number | null
  }

  export type DecisionLogMinAggregateOutputType = {
    id: string | null
    symbol: string | null
    timeframe: string | null
    action: $Enums.DecisionAction | null
    status: $Enums.DecisionStatus | null
    model: string | null
    inputPrompt: string | null
    outputDecision: string | null
    rationale: string | null
    confidenceScore: number | null
    proposedSl: number | null
    proposedTp: number | null
    proposedVolume: number | null
    latencyMs: number | null
    error: string | null
    signalId: string | null
    sessionWindowId: string | null
    pendingOrderId: string | null
    tradeId: string | null
    createdAt: Date | null
  }

  export type DecisionLogMaxAggregateOutputType = {
    id: string | null
    symbol: string | null
    timeframe: string | null
    action: $Enums.DecisionAction | null
    status: $Enums.DecisionStatus | null
    model: string | null
    inputPrompt: string | null
    outputDecision: string | null
    rationale: string | null
    confidenceScore: number | null
    proposedSl: number | null
    proposedTp: number | null
    proposedVolume: number | null
    latencyMs: number | null
    error: string | null
    signalId: string | null
    sessionWindowId: string | null
    pendingOrderId: string | null
    tradeId: string | null
    createdAt: Date | null
  }

  export type DecisionLogCountAggregateOutputType = {
    id: number
    symbol: number
    timeframe: number
    action: number
    status: number
    model: number
    inputPrompt: number
    outputDecision: number
    rationale: number
    confidenceScore: number
    proposedSl: number
    proposedTp: number
    proposedVolume: number
    latencyMs: number
    error: number
    signalId: number
    sessionWindowId: number
    pendingOrderId: number
    tradeId: number
    createdAt: number
    _all: number
  }


  export type DecisionLogAvgAggregateInputType = {
    confidenceScore?: true
    proposedSl?: true
    proposedTp?: true
    proposedVolume?: true
    latencyMs?: true
  }

  export type DecisionLogSumAggregateInputType = {
    confidenceScore?: true
    proposedSl?: true
    proposedTp?: true
    proposedVolume?: true
    latencyMs?: true
  }

  export type DecisionLogMinAggregateInputType = {
    id?: true
    symbol?: true
    timeframe?: true
    action?: true
    status?: true
    model?: true
    inputPrompt?: true
    outputDecision?: true
    rationale?: true
    confidenceScore?: true
    proposedSl?: true
    proposedTp?: true
    proposedVolume?: true
    latencyMs?: true
    error?: true
    signalId?: true
    sessionWindowId?: true
    pendingOrderId?: true
    tradeId?: true
    createdAt?: true
  }

  export type DecisionLogMaxAggregateInputType = {
    id?: true
    symbol?: true
    timeframe?: true
    action?: true
    status?: true
    model?: true
    inputPrompt?: true
    outputDecision?: true
    rationale?: true
    confidenceScore?: true
    proposedSl?: true
    proposedTp?: true
    proposedVolume?: true
    latencyMs?: true
    error?: true
    signalId?: true
    sessionWindowId?: true
    pendingOrderId?: true
    tradeId?: true
    createdAt?: true
  }

  export type DecisionLogCountAggregateInputType = {
    id?: true
    symbol?: true
    timeframe?: true
    action?: true
    status?: true
    model?: true
    inputPrompt?: true
    outputDecision?: true
    rationale?: true
    confidenceScore?: true
    proposedSl?: true
    proposedTp?: true
    proposedVolume?: true
    latencyMs?: true
    error?: true
    signalId?: true
    sessionWindowId?: true
    pendingOrderId?: true
    tradeId?: true
    createdAt?: true
    _all?: true
  }

  export type DecisionLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DecisionLog to aggregate.
     */
    where?: DecisionLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DecisionLogs to fetch.
     */
    orderBy?: DecisionLogOrderByWithRelationInput | DecisionLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DecisionLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DecisionLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DecisionLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DecisionLogs
    **/
    _count?: true | DecisionLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DecisionLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DecisionLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DecisionLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DecisionLogMaxAggregateInputType
  }

  export type GetDecisionLogAggregateType<T extends DecisionLogAggregateArgs> = {
        [P in keyof T & keyof AggregateDecisionLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDecisionLog[P]>
      : GetScalarType<T[P], AggregateDecisionLog[P]>
  }




  export type DecisionLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DecisionLogWhereInput
    orderBy?: DecisionLogOrderByWithAggregationInput | DecisionLogOrderByWithAggregationInput[]
    by: DecisionLogScalarFieldEnum[] | DecisionLogScalarFieldEnum
    having?: DecisionLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DecisionLogCountAggregateInputType | true
    _avg?: DecisionLogAvgAggregateInputType
    _sum?: DecisionLogSumAggregateInputType
    _min?: DecisionLogMinAggregateInputType
    _max?: DecisionLogMaxAggregateInputType
  }

  export type DecisionLogGroupByOutputType = {
    id: string
    symbol: string
    timeframe: string | null
    action: $Enums.DecisionAction
    status: $Enums.DecisionStatus
    model: string | null
    inputPrompt: string
    outputDecision: string
    rationale: string | null
    confidenceScore: number | null
    proposedSl: number | null
    proposedTp: number | null
    proposedVolume: number | null
    latencyMs: number | null
    error: string | null
    signalId: string | null
    sessionWindowId: string | null
    pendingOrderId: string | null
    tradeId: string | null
    createdAt: Date
    _count: DecisionLogCountAggregateOutputType | null
    _avg: DecisionLogAvgAggregateOutputType | null
    _sum: DecisionLogSumAggregateOutputType | null
    _min: DecisionLogMinAggregateOutputType | null
    _max: DecisionLogMaxAggregateOutputType | null
  }

  type GetDecisionLogGroupByPayload<T extends DecisionLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DecisionLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DecisionLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DecisionLogGroupByOutputType[P]>
            : GetScalarType<T[P], DecisionLogGroupByOutputType[P]>
        }
      >
    >


  export type DecisionLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    symbol?: boolean
    timeframe?: boolean
    action?: boolean
    status?: boolean
    model?: boolean
    inputPrompt?: boolean
    outputDecision?: boolean
    rationale?: boolean
    confidenceScore?: boolean
    proposedSl?: boolean
    proposedTp?: boolean
    proposedVolume?: boolean
    latencyMs?: boolean
    error?: boolean
    signalId?: boolean
    sessionWindowId?: boolean
    pendingOrderId?: boolean
    tradeId?: boolean
    createdAt?: boolean
    signal?: boolean | DecisionLog$signalArgs<ExtArgs>
    sessionWindow?: boolean | DecisionLog$sessionWindowArgs<ExtArgs>
    pendingOrder?: boolean | DecisionLog$pendingOrderArgs<ExtArgs>
    trade?: boolean | DecisionLog$tradeArgs<ExtArgs>
  }, ExtArgs["result"]["decisionLog"]>

  export type DecisionLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    symbol?: boolean
    timeframe?: boolean
    action?: boolean
    status?: boolean
    model?: boolean
    inputPrompt?: boolean
    outputDecision?: boolean
    rationale?: boolean
    confidenceScore?: boolean
    proposedSl?: boolean
    proposedTp?: boolean
    proposedVolume?: boolean
    latencyMs?: boolean
    error?: boolean
    signalId?: boolean
    sessionWindowId?: boolean
    pendingOrderId?: boolean
    tradeId?: boolean
    createdAt?: boolean
    signal?: boolean | DecisionLog$signalArgs<ExtArgs>
    sessionWindow?: boolean | DecisionLog$sessionWindowArgs<ExtArgs>
    pendingOrder?: boolean | DecisionLog$pendingOrderArgs<ExtArgs>
    trade?: boolean | DecisionLog$tradeArgs<ExtArgs>
  }, ExtArgs["result"]["decisionLog"]>

  export type DecisionLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    symbol?: boolean
    timeframe?: boolean
    action?: boolean
    status?: boolean
    model?: boolean
    inputPrompt?: boolean
    outputDecision?: boolean
    rationale?: boolean
    confidenceScore?: boolean
    proposedSl?: boolean
    proposedTp?: boolean
    proposedVolume?: boolean
    latencyMs?: boolean
    error?: boolean
    signalId?: boolean
    sessionWindowId?: boolean
    pendingOrderId?: boolean
    tradeId?: boolean
    createdAt?: boolean
    signal?: boolean | DecisionLog$signalArgs<ExtArgs>
    sessionWindow?: boolean | DecisionLog$sessionWindowArgs<ExtArgs>
    pendingOrder?: boolean | DecisionLog$pendingOrderArgs<ExtArgs>
    trade?: boolean | DecisionLog$tradeArgs<ExtArgs>
  }, ExtArgs["result"]["decisionLog"]>

  export type DecisionLogSelectScalar = {
    id?: boolean
    symbol?: boolean
    timeframe?: boolean
    action?: boolean
    status?: boolean
    model?: boolean
    inputPrompt?: boolean
    outputDecision?: boolean
    rationale?: boolean
    confidenceScore?: boolean
    proposedSl?: boolean
    proposedTp?: boolean
    proposedVolume?: boolean
    latencyMs?: boolean
    error?: boolean
    signalId?: boolean
    sessionWindowId?: boolean
    pendingOrderId?: boolean
    tradeId?: boolean
    createdAt?: boolean
  }

  export type DecisionLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "symbol" | "timeframe" | "action" | "status" | "model" | "inputPrompt" | "outputDecision" | "rationale" | "confidenceScore" | "proposedSl" | "proposedTp" | "proposedVolume" | "latencyMs" | "error" | "signalId" | "sessionWindowId" | "pendingOrderId" | "tradeId" | "createdAt", ExtArgs["result"]["decisionLog"]>
  export type DecisionLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    signal?: boolean | DecisionLog$signalArgs<ExtArgs>
    sessionWindow?: boolean | DecisionLog$sessionWindowArgs<ExtArgs>
    pendingOrder?: boolean | DecisionLog$pendingOrderArgs<ExtArgs>
    trade?: boolean | DecisionLog$tradeArgs<ExtArgs>
  }
  export type DecisionLogIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    signal?: boolean | DecisionLog$signalArgs<ExtArgs>
    sessionWindow?: boolean | DecisionLog$sessionWindowArgs<ExtArgs>
    pendingOrder?: boolean | DecisionLog$pendingOrderArgs<ExtArgs>
    trade?: boolean | DecisionLog$tradeArgs<ExtArgs>
  }
  export type DecisionLogIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    signal?: boolean | DecisionLog$signalArgs<ExtArgs>
    sessionWindow?: boolean | DecisionLog$sessionWindowArgs<ExtArgs>
    pendingOrder?: boolean | DecisionLog$pendingOrderArgs<ExtArgs>
    trade?: boolean | DecisionLog$tradeArgs<ExtArgs>
  }

  export type $DecisionLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DecisionLog"
    objects: {
      signal: Prisma.$SignalPayload<ExtArgs> | null
      sessionWindow: Prisma.$SessionWindowPayload<ExtArgs> | null
      pendingOrder: Prisma.$PendingOrderPayload<ExtArgs> | null
      trade: Prisma.$TradePayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      symbol: string
      timeframe: string | null
      action: $Enums.DecisionAction
      status: $Enums.DecisionStatus
      model: string | null
      inputPrompt: string
      outputDecision: string
      rationale: string | null
      confidenceScore: number | null
      proposedSl: number | null
      proposedTp: number | null
      proposedVolume: number | null
      latencyMs: number | null
      error: string | null
      signalId: string | null
      sessionWindowId: string | null
      pendingOrderId: string | null
      tradeId: string | null
      createdAt: Date
    }, ExtArgs["result"]["decisionLog"]>
    composites: {}
  }

  type DecisionLogGetPayload<S extends boolean | null | undefined | DecisionLogDefaultArgs> = $Result.GetResult<Prisma.$DecisionLogPayload, S>

  type DecisionLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DecisionLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DecisionLogCountAggregateInputType | true
    }

  export interface DecisionLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DecisionLog'], meta: { name: 'DecisionLog' } }
    /**
     * Find zero or one DecisionLog that matches the filter.
     * @param {DecisionLogFindUniqueArgs} args - Arguments to find a DecisionLog
     * @example
     * // Get one DecisionLog
     * const decisionLog = await prisma.decisionLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DecisionLogFindUniqueArgs>(args: SelectSubset<T, DecisionLogFindUniqueArgs<ExtArgs>>): Prisma__DecisionLogClient<$Result.GetResult<Prisma.$DecisionLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DecisionLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DecisionLogFindUniqueOrThrowArgs} args - Arguments to find a DecisionLog
     * @example
     * // Get one DecisionLog
     * const decisionLog = await prisma.decisionLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DecisionLogFindUniqueOrThrowArgs>(args: SelectSubset<T, DecisionLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DecisionLogClient<$Result.GetResult<Prisma.$DecisionLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DecisionLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DecisionLogFindFirstArgs} args - Arguments to find a DecisionLog
     * @example
     * // Get one DecisionLog
     * const decisionLog = await prisma.decisionLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DecisionLogFindFirstArgs>(args?: SelectSubset<T, DecisionLogFindFirstArgs<ExtArgs>>): Prisma__DecisionLogClient<$Result.GetResult<Prisma.$DecisionLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DecisionLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DecisionLogFindFirstOrThrowArgs} args - Arguments to find a DecisionLog
     * @example
     * // Get one DecisionLog
     * const decisionLog = await prisma.decisionLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DecisionLogFindFirstOrThrowArgs>(args?: SelectSubset<T, DecisionLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__DecisionLogClient<$Result.GetResult<Prisma.$DecisionLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DecisionLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DecisionLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DecisionLogs
     * const decisionLogs = await prisma.decisionLog.findMany()
     * 
     * // Get first 10 DecisionLogs
     * const decisionLogs = await prisma.decisionLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const decisionLogWithIdOnly = await prisma.decisionLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DecisionLogFindManyArgs>(args?: SelectSubset<T, DecisionLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DecisionLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DecisionLog.
     * @param {DecisionLogCreateArgs} args - Arguments to create a DecisionLog.
     * @example
     * // Create one DecisionLog
     * const DecisionLog = await prisma.decisionLog.create({
     *   data: {
     *     // ... data to create a DecisionLog
     *   }
     * })
     * 
     */
    create<T extends DecisionLogCreateArgs>(args: SelectSubset<T, DecisionLogCreateArgs<ExtArgs>>): Prisma__DecisionLogClient<$Result.GetResult<Prisma.$DecisionLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DecisionLogs.
     * @param {DecisionLogCreateManyArgs} args - Arguments to create many DecisionLogs.
     * @example
     * // Create many DecisionLogs
     * const decisionLog = await prisma.decisionLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DecisionLogCreateManyArgs>(args?: SelectSubset<T, DecisionLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DecisionLogs and returns the data saved in the database.
     * @param {DecisionLogCreateManyAndReturnArgs} args - Arguments to create many DecisionLogs.
     * @example
     * // Create many DecisionLogs
     * const decisionLog = await prisma.decisionLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DecisionLogs and only return the `id`
     * const decisionLogWithIdOnly = await prisma.decisionLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DecisionLogCreateManyAndReturnArgs>(args?: SelectSubset<T, DecisionLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DecisionLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DecisionLog.
     * @param {DecisionLogDeleteArgs} args - Arguments to delete one DecisionLog.
     * @example
     * // Delete one DecisionLog
     * const DecisionLog = await prisma.decisionLog.delete({
     *   where: {
     *     // ... filter to delete one DecisionLog
     *   }
     * })
     * 
     */
    delete<T extends DecisionLogDeleteArgs>(args: SelectSubset<T, DecisionLogDeleteArgs<ExtArgs>>): Prisma__DecisionLogClient<$Result.GetResult<Prisma.$DecisionLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DecisionLog.
     * @param {DecisionLogUpdateArgs} args - Arguments to update one DecisionLog.
     * @example
     * // Update one DecisionLog
     * const decisionLog = await prisma.decisionLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DecisionLogUpdateArgs>(args: SelectSubset<T, DecisionLogUpdateArgs<ExtArgs>>): Prisma__DecisionLogClient<$Result.GetResult<Prisma.$DecisionLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DecisionLogs.
     * @param {DecisionLogDeleteManyArgs} args - Arguments to filter DecisionLogs to delete.
     * @example
     * // Delete a few DecisionLogs
     * const { count } = await prisma.decisionLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DecisionLogDeleteManyArgs>(args?: SelectSubset<T, DecisionLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DecisionLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DecisionLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DecisionLogs
     * const decisionLog = await prisma.decisionLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DecisionLogUpdateManyArgs>(args: SelectSubset<T, DecisionLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DecisionLogs and returns the data updated in the database.
     * @param {DecisionLogUpdateManyAndReturnArgs} args - Arguments to update many DecisionLogs.
     * @example
     * // Update many DecisionLogs
     * const decisionLog = await prisma.decisionLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DecisionLogs and only return the `id`
     * const decisionLogWithIdOnly = await prisma.decisionLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DecisionLogUpdateManyAndReturnArgs>(args: SelectSubset<T, DecisionLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DecisionLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DecisionLog.
     * @param {DecisionLogUpsertArgs} args - Arguments to update or create a DecisionLog.
     * @example
     * // Update or create a DecisionLog
     * const decisionLog = await prisma.decisionLog.upsert({
     *   create: {
     *     // ... data to create a DecisionLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DecisionLog we want to update
     *   }
     * })
     */
    upsert<T extends DecisionLogUpsertArgs>(args: SelectSubset<T, DecisionLogUpsertArgs<ExtArgs>>): Prisma__DecisionLogClient<$Result.GetResult<Prisma.$DecisionLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DecisionLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DecisionLogCountArgs} args - Arguments to filter DecisionLogs to count.
     * @example
     * // Count the number of DecisionLogs
     * const count = await prisma.decisionLog.count({
     *   where: {
     *     // ... the filter for the DecisionLogs we want to count
     *   }
     * })
    **/
    count<T extends DecisionLogCountArgs>(
      args?: Subset<T, DecisionLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DecisionLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DecisionLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DecisionLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DecisionLogAggregateArgs>(args: Subset<T, DecisionLogAggregateArgs>): Prisma.PrismaPromise<GetDecisionLogAggregateType<T>>

    /**
     * Group by DecisionLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DecisionLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DecisionLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DecisionLogGroupByArgs['orderBy'] }
        : { orderBy?: DecisionLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DecisionLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDecisionLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DecisionLog model
   */
  readonly fields: DecisionLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DecisionLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DecisionLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    signal<T extends DecisionLog$signalArgs<ExtArgs> = {}>(args?: Subset<T, DecisionLog$signalArgs<ExtArgs>>): Prisma__SignalClient<$Result.GetResult<Prisma.$SignalPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    sessionWindow<T extends DecisionLog$sessionWindowArgs<ExtArgs> = {}>(args?: Subset<T, DecisionLog$sessionWindowArgs<ExtArgs>>): Prisma__SessionWindowClient<$Result.GetResult<Prisma.$SessionWindowPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    pendingOrder<T extends DecisionLog$pendingOrderArgs<ExtArgs> = {}>(args?: Subset<T, DecisionLog$pendingOrderArgs<ExtArgs>>): Prisma__PendingOrderClient<$Result.GetResult<Prisma.$PendingOrderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    trade<T extends DecisionLog$tradeArgs<ExtArgs> = {}>(args?: Subset<T, DecisionLog$tradeArgs<ExtArgs>>): Prisma__TradeClient<$Result.GetResult<Prisma.$TradePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DecisionLog model
   */
  interface DecisionLogFieldRefs {
    readonly id: FieldRef<"DecisionLog", 'String'>
    readonly symbol: FieldRef<"DecisionLog", 'String'>
    readonly timeframe: FieldRef<"DecisionLog", 'String'>
    readonly action: FieldRef<"DecisionLog", 'DecisionAction'>
    readonly status: FieldRef<"DecisionLog", 'DecisionStatus'>
    readonly model: FieldRef<"DecisionLog", 'String'>
    readonly inputPrompt: FieldRef<"DecisionLog", 'String'>
    readonly outputDecision: FieldRef<"DecisionLog", 'String'>
    readonly rationale: FieldRef<"DecisionLog", 'String'>
    readonly confidenceScore: FieldRef<"DecisionLog", 'Float'>
    readonly proposedSl: FieldRef<"DecisionLog", 'Float'>
    readonly proposedTp: FieldRef<"DecisionLog", 'Float'>
    readonly proposedVolume: FieldRef<"DecisionLog", 'Float'>
    readonly latencyMs: FieldRef<"DecisionLog", 'Int'>
    readonly error: FieldRef<"DecisionLog", 'String'>
    readonly signalId: FieldRef<"DecisionLog", 'String'>
    readonly sessionWindowId: FieldRef<"DecisionLog", 'String'>
    readonly pendingOrderId: FieldRef<"DecisionLog", 'String'>
    readonly tradeId: FieldRef<"DecisionLog", 'String'>
    readonly createdAt: FieldRef<"DecisionLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DecisionLog findUnique
   */
  export type DecisionLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionLog
     */
    select?: DecisionLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DecisionLog
     */
    omit?: DecisionLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DecisionLogInclude<ExtArgs> | null
    /**
     * Filter, which DecisionLog to fetch.
     */
    where: DecisionLogWhereUniqueInput
  }

  /**
   * DecisionLog findUniqueOrThrow
   */
  export type DecisionLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionLog
     */
    select?: DecisionLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DecisionLog
     */
    omit?: DecisionLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DecisionLogInclude<ExtArgs> | null
    /**
     * Filter, which DecisionLog to fetch.
     */
    where: DecisionLogWhereUniqueInput
  }

  /**
   * DecisionLog findFirst
   */
  export type DecisionLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionLog
     */
    select?: DecisionLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DecisionLog
     */
    omit?: DecisionLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DecisionLogInclude<ExtArgs> | null
    /**
     * Filter, which DecisionLog to fetch.
     */
    where?: DecisionLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DecisionLogs to fetch.
     */
    orderBy?: DecisionLogOrderByWithRelationInput | DecisionLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DecisionLogs.
     */
    cursor?: DecisionLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DecisionLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DecisionLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DecisionLogs.
     */
    distinct?: DecisionLogScalarFieldEnum | DecisionLogScalarFieldEnum[]
  }

  /**
   * DecisionLog findFirstOrThrow
   */
  export type DecisionLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionLog
     */
    select?: DecisionLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DecisionLog
     */
    omit?: DecisionLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DecisionLogInclude<ExtArgs> | null
    /**
     * Filter, which DecisionLog to fetch.
     */
    where?: DecisionLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DecisionLogs to fetch.
     */
    orderBy?: DecisionLogOrderByWithRelationInput | DecisionLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DecisionLogs.
     */
    cursor?: DecisionLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DecisionLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DecisionLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DecisionLogs.
     */
    distinct?: DecisionLogScalarFieldEnum | DecisionLogScalarFieldEnum[]
  }

  /**
   * DecisionLog findMany
   */
  export type DecisionLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionLog
     */
    select?: DecisionLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DecisionLog
     */
    omit?: DecisionLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DecisionLogInclude<ExtArgs> | null
    /**
     * Filter, which DecisionLogs to fetch.
     */
    where?: DecisionLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DecisionLogs to fetch.
     */
    orderBy?: DecisionLogOrderByWithRelationInput | DecisionLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DecisionLogs.
     */
    cursor?: DecisionLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DecisionLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DecisionLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DecisionLogs.
     */
    distinct?: DecisionLogScalarFieldEnum | DecisionLogScalarFieldEnum[]
  }

  /**
   * DecisionLog create
   */
  export type DecisionLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionLog
     */
    select?: DecisionLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DecisionLog
     */
    omit?: DecisionLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DecisionLogInclude<ExtArgs> | null
    /**
     * The data needed to create a DecisionLog.
     */
    data: XOR<DecisionLogCreateInput, DecisionLogUncheckedCreateInput>
  }

  /**
   * DecisionLog createMany
   */
  export type DecisionLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DecisionLogs.
     */
    data: DecisionLogCreateManyInput | DecisionLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DecisionLog createManyAndReturn
   */
  export type DecisionLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionLog
     */
    select?: DecisionLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DecisionLog
     */
    omit?: DecisionLogOmit<ExtArgs> | null
    /**
     * The data used to create many DecisionLogs.
     */
    data: DecisionLogCreateManyInput | DecisionLogCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DecisionLogIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * DecisionLog update
   */
  export type DecisionLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionLog
     */
    select?: DecisionLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DecisionLog
     */
    omit?: DecisionLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DecisionLogInclude<ExtArgs> | null
    /**
     * The data needed to update a DecisionLog.
     */
    data: XOR<DecisionLogUpdateInput, DecisionLogUncheckedUpdateInput>
    /**
     * Choose, which DecisionLog to update.
     */
    where: DecisionLogWhereUniqueInput
  }

  /**
   * DecisionLog updateMany
   */
  export type DecisionLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DecisionLogs.
     */
    data: XOR<DecisionLogUpdateManyMutationInput, DecisionLogUncheckedUpdateManyInput>
    /**
     * Filter which DecisionLogs to update
     */
    where?: DecisionLogWhereInput
    /**
     * Limit how many DecisionLogs to update.
     */
    limit?: number
  }

  /**
   * DecisionLog updateManyAndReturn
   */
  export type DecisionLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionLog
     */
    select?: DecisionLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DecisionLog
     */
    omit?: DecisionLogOmit<ExtArgs> | null
    /**
     * The data used to update DecisionLogs.
     */
    data: XOR<DecisionLogUpdateManyMutationInput, DecisionLogUncheckedUpdateManyInput>
    /**
     * Filter which DecisionLogs to update
     */
    where?: DecisionLogWhereInput
    /**
     * Limit how many DecisionLogs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DecisionLogIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * DecisionLog upsert
   */
  export type DecisionLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionLog
     */
    select?: DecisionLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DecisionLog
     */
    omit?: DecisionLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DecisionLogInclude<ExtArgs> | null
    /**
     * The filter to search for the DecisionLog to update in case it exists.
     */
    where: DecisionLogWhereUniqueInput
    /**
     * In case the DecisionLog found by the `where` argument doesn't exist, create a new DecisionLog with this data.
     */
    create: XOR<DecisionLogCreateInput, DecisionLogUncheckedCreateInput>
    /**
     * In case the DecisionLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DecisionLogUpdateInput, DecisionLogUncheckedUpdateInput>
  }

  /**
   * DecisionLog delete
   */
  export type DecisionLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionLog
     */
    select?: DecisionLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DecisionLog
     */
    omit?: DecisionLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DecisionLogInclude<ExtArgs> | null
    /**
     * Filter which DecisionLog to delete.
     */
    where: DecisionLogWhereUniqueInput
  }

  /**
   * DecisionLog deleteMany
   */
  export type DecisionLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DecisionLogs to delete
     */
    where?: DecisionLogWhereInput
    /**
     * Limit how many DecisionLogs to delete.
     */
    limit?: number
  }

  /**
   * DecisionLog.signal
   */
  export type DecisionLog$signalArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Signal
     */
    select?: SignalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Signal
     */
    omit?: SignalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SignalInclude<ExtArgs> | null
    where?: SignalWhereInput
  }

  /**
   * DecisionLog.sessionWindow
   */
  export type DecisionLog$sessionWindowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SessionWindow
     */
    select?: SessionWindowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SessionWindow
     */
    omit?: SessionWindowOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionWindowInclude<ExtArgs> | null
    where?: SessionWindowWhereInput
  }

  /**
   * DecisionLog.pendingOrder
   */
  export type DecisionLog$pendingOrderArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingOrder
     */
    select?: PendingOrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PendingOrder
     */
    omit?: PendingOrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingOrderInclude<ExtArgs> | null
    where?: PendingOrderWhereInput
  }

  /**
   * DecisionLog.trade
   */
  export type DecisionLog$tradeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trade
     */
    select?: TradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Trade
     */
    omit?: TradeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TradeInclude<ExtArgs> | null
    where?: TradeWhereInput
  }

  /**
   * DecisionLog without action
   */
  export type DecisionLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionLog
     */
    select?: DecisionLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DecisionLog
     */
    omit?: DecisionLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DecisionLogInclude<ExtArgs> | null
  }


  /**
   * Model PendingOrder
   */

  export type AggregatePendingOrder = {
    _count: PendingOrderCountAggregateOutputType | null
    _avg: PendingOrderAvgAggregateOutputType | null
    _sum: PendingOrderSumAggregateOutputType | null
    _min: PendingOrderMinAggregateOutputType | null
    _max: PendingOrderMaxAggregateOutputType | null
  }

  export type PendingOrderAvgAggregateOutputType = {
    ticket: number | null
    volume: number | null
    price: number | null
    stopLoss: number | null
    takeProfit: number | null
    magic: number | null
  }

  export type PendingOrderSumAggregateOutputType = {
    ticket: bigint | null
    volume: number | null
    price: number | null
    stopLoss: number | null
    takeProfit: number | null
    magic: number | null
  }

  export type PendingOrderMinAggregateOutputType = {
    id: string | null
    ticket: bigint | null
    symbol: string | null
    type: $Enums.PendingOrderType | null
    status: $Enums.PendingOrderStatus | null
    volume: number | null
    price: number | null
    stopLoss: number | null
    takeProfit: number | null
    magic: number | null
    strategy: string | null
    comment: string | null
    placedAt: Date | null
    expiresAt: Date | null
    triggeredAt: Date | null
    updatedAt: Date | null
  }

  export type PendingOrderMaxAggregateOutputType = {
    id: string | null
    ticket: bigint | null
    symbol: string | null
    type: $Enums.PendingOrderType | null
    status: $Enums.PendingOrderStatus | null
    volume: number | null
    price: number | null
    stopLoss: number | null
    takeProfit: number | null
    magic: number | null
    strategy: string | null
    comment: string | null
    placedAt: Date | null
    expiresAt: Date | null
    triggeredAt: Date | null
    updatedAt: Date | null
  }

  export type PendingOrderCountAggregateOutputType = {
    id: number
    ticket: number
    symbol: number
    type: number
    status: number
    volume: number
    price: number
    stopLoss: number
    takeProfit: number
    magic: number
    strategy: number
    comment: number
    placedAt: number
    expiresAt: number
    triggeredAt: number
    updatedAt: number
    _all: number
  }


  export type PendingOrderAvgAggregateInputType = {
    ticket?: true
    volume?: true
    price?: true
    stopLoss?: true
    takeProfit?: true
    magic?: true
  }

  export type PendingOrderSumAggregateInputType = {
    ticket?: true
    volume?: true
    price?: true
    stopLoss?: true
    takeProfit?: true
    magic?: true
  }

  export type PendingOrderMinAggregateInputType = {
    id?: true
    ticket?: true
    symbol?: true
    type?: true
    status?: true
    volume?: true
    price?: true
    stopLoss?: true
    takeProfit?: true
    magic?: true
    strategy?: true
    comment?: true
    placedAt?: true
    expiresAt?: true
    triggeredAt?: true
    updatedAt?: true
  }

  export type PendingOrderMaxAggregateInputType = {
    id?: true
    ticket?: true
    symbol?: true
    type?: true
    status?: true
    volume?: true
    price?: true
    stopLoss?: true
    takeProfit?: true
    magic?: true
    strategy?: true
    comment?: true
    placedAt?: true
    expiresAt?: true
    triggeredAt?: true
    updatedAt?: true
  }

  export type PendingOrderCountAggregateInputType = {
    id?: true
    ticket?: true
    symbol?: true
    type?: true
    status?: true
    volume?: true
    price?: true
    stopLoss?: true
    takeProfit?: true
    magic?: true
    strategy?: true
    comment?: true
    placedAt?: true
    expiresAt?: true
    triggeredAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PendingOrderAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PendingOrder to aggregate.
     */
    where?: PendingOrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PendingOrders to fetch.
     */
    orderBy?: PendingOrderOrderByWithRelationInput | PendingOrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PendingOrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PendingOrders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PendingOrders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PendingOrders
    **/
    _count?: true | PendingOrderCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PendingOrderAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PendingOrderSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PendingOrderMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PendingOrderMaxAggregateInputType
  }

  export type GetPendingOrderAggregateType<T extends PendingOrderAggregateArgs> = {
        [P in keyof T & keyof AggregatePendingOrder]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePendingOrder[P]>
      : GetScalarType<T[P], AggregatePendingOrder[P]>
  }




  export type PendingOrderGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PendingOrderWhereInput
    orderBy?: PendingOrderOrderByWithAggregationInput | PendingOrderOrderByWithAggregationInput[]
    by: PendingOrderScalarFieldEnum[] | PendingOrderScalarFieldEnum
    having?: PendingOrderScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PendingOrderCountAggregateInputType | true
    _avg?: PendingOrderAvgAggregateInputType
    _sum?: PendingOrderSumAggregateInputType
    _min?: PendingOrderMinAggregateInputType
    _max?: PendingOrderMaxAggregateInputType
  }

  export type PendingOrderGroupByOutputType = {
    id: string
    ticket: bigint
    symbol: string
    type: $Enums.PendingOrderType
    status: $Enums.PendingOrderStatus
    volume: number
    price: number
    stopLoss: number | null
    takeProfit: number | null
    magic: number | null
    strategy: string | null
    comment: string | null
    placedAt: Date
    expiresAt: Date | null
    triggeredAt: Date | null
    updatedAt: Date
    _count: PendingOrderCountAggregateOutputType | null
    _avg: PendingOrderAvgAggregateOutputType | null
    _sum: PendingOrderSumAggregateOutputType | null
    _min: PendingOrderMinAggregateOutputType | null
    _max: PendingOrderMaxAggregateOutputType | null
  }

  type GetPendingOrderGroupByPayload<T extends PendingOrderGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PendingOrderGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PendingOrderGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PendingOrderGroupByOutputType[P]>
            : GetScalarType<T[P], PendingOrderGroupByOutputType[P]>
        }
      >
    >


  export type PendingOrderSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ticket?: boolean
    symbol?: boolean
    type?: boolean
    status?: boolean
    volume?: boolean
    price?: boolean
    stopLoss?: boolean
    takeProfit?: boolean
    magic?: boolean
    strategy?: boolean
    comment?: boolean
    placedAt?: boolean
    expiresAt?: boolean
    triggeredAt?: boolean
    updatedAt?: boolean
    decision?: boolean | PendingOrder$decisionArgs<ExtArgs>
  }, ExtArgs["result"]["pendingOrder"]>

  export type PendingOrderSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ticket?: boolean
    symbol?: boolean
    type?: boolean
    status?: boolean
    volume?: boolean
    price?: boolean
    stopLoss?: boolean
    takeProfit?: boolean
    magic?: boolean
    strategy?: boolean
    comment?: boolean
    placedAt?: boolean
    expiresAt?: boolean
    triggeredAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["pendingOrder"]>

  export type PendingOrderSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ticket?: boolean
    symbol?: boolean
    type?: boolean
    status?: boolean
    volume?: boolean
    price?: boolean
    stopLoss?: boolean
    takeProfit?: boolean
    magic?: boolean
    strategy?: boolean
    comment?: boolean
    placedAt?: boolean
    expiresAt?: boolean
    triggeredAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["pendingOrder"]>

  export type PendingOrderSelectScalar = {
    id?: boolean
    ticket?: boolean
    symbol?: boolean
    type?: boolean
    status?: boolean
    volume?: boolean
    price?: boolean
    stopLoss?: boolean
    takeProfit?: boolean
    magic?: boolean
    strategy?: boolean
    comment?: boolean
    placedAt?: boolean
    expiresAt?: boolean
    triggeredAt?: boolean
    updatedAt?: boolean
  }

  export type PendingOrderOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "ticket" | "symbol" | "type" | "status" | "volume" | "price" | "stopLoss" | "takeProfit" | "magic" | "strategy" | "comment" | "placedAt" | "expiresAt" | "triggeredAt" | "updatedAt", ExtArgs["result"]["pendingOrder"]>
  export type PendingOrderInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    decision?: boolean | PendingOrder$decisionArgs<ExtArgs>
  }
  export type PendingOrderIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type PendingOrderIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $PendingOrderPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PendingOrder"
    objects: {
      decision: Prisma.$DecisionLogPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      ticket: bigint
      symbol: string
      type: $Enums.PendingOrderType
      status: $Enums.PendingOrderStatus
      volume: number
      price: number
      stopLoss: number | null
      takeProfit: number | null
      magic: number | null
      strategy: string | null
      comment: string | null
      placedAt: Date
      expiresAt: Date | null
      triggeredAt: Date | null
      updatedAt: Date
    }, ExtArgs["result"]["pendingOrder"]>
    composites: {}
  }

  type PendingOrderGetPayload<S extends boolean | null | undefined | PendingOrderDefaultArgs> = $Result.GetResult<Prisma.$PendingOrderPayload, S>

  type PendingOrderCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PendingOrderFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PendingOrderCountAggregateInputType | true
    }

  export interface PendingOrderDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PendingOrder'], meta: { name: 'PendingOrder' } }
    /**
     * Find zero or one PendingOrder that matches the filter.
     * @param {PendingOrderFindUniqueArgs} args - Arguments to find a PendingOrder
     * @example
     * // Get one PendingOrder
     * const pendingOrder = await prisma.pendingOrder.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PendingOrderFindUniqueArgs>(args: SelectSubset<T, PendingOrderFindUniqueArgs<ExtArgs>>): Prisma__PendingOrderClient<$Result.GetResult<Prisma.$PendingOrderPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PendingOrder that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PendingOrderFindUniqueOrThrowArgs} args - Arguments to find a PendingOrder
     * @example
     * // Get one PendingOrder
     * const pendingOrder = await prisma.pendingOrder.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PendingOrderFindUniqueOrThrowArgs>(args: SelectSubset<T, PendingOrderFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PendingOrderClient<$Result.GetResult<Prisma.$PendingOrderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PendingOrder that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PendingOrderFindFirstArgs} args - Arguments to find a PendingOrder
     * @example
     * // Get one PendingOrder
     * const pendingOrder = await prisma.pendingOrder.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PendingOrderFindFirstArgs>(args?: SelectSubset<T, PendingOrderFindFirstArgs<ExtArgs>>): Prisma__PendingOrderClient<$Result.GetResult<Prisma.$PendingOrderPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PendingOrder that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PendingOrderFindFirstOrThrowArgs} args - Arguments to find a PendingOrder
     * @example
     * // Get one PendingOrder
     * const pendingOrder = await prisma.pendingOrder.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PendingOrderFindFirstOrThrowArgs>(args?: SelectSubset<T, PendingOrderFindFirstOrThrowArgs<ExtArgs>>): Prisma__PendingOrderClient<$Result.GetResult<Prisma.$PendingOrderPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PendingOrders that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PendingOrderFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PendingOrders
     * const pendingOrders = await prisma.pendingOrder.findMany()
     * 
     * // Get first 10 PendingOrders
     * const pendingOrders = await prisma.pendingOrder.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const pendingOrderWithIdOnly = await prisma.pendingOrder.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PendingOrderFindManyArgs>(args?: SelectSubset<T, PendingOrderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PendingOrderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PendingOrder.
     * @param {PendingOrderCreateArgs} args - Arguments to create a PendingOrder.
     * @example
     * // Create one PendingOrder
     * const PendingOrder = await prisma.pendingOrder.create({
     *   data: {
     *     // ... data to create a PendingOrder
     *   }
     * })
     * 
     */
    create<T extends PendingOrderCreateArgs>(args: SelectSubset<T, PendingOrderCreateArgs<ExtArgs>>): Prisma__PendingOrderClient<$Result.GetResult<Prisma.$PendingOrderPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PendingOrders.
     * @param {PendingOrderCreateManyArgs} args - Arguments to create many PendingOrders.
     * @example
     * // Create many PendingOrders
     * const pendingOrder = await prisma.pendingOrder.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PendingOrderCreateManyArgs>(args?: SelectSubset<T, PendingOrderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PendingOrders and returns the data saved in the database.
     * @param {PendingOrderCreateManyAndReturnArgs} args - Arguments to create many PendingOrders.
     * @example
     * // Create many PendingOrders
     * const pendingOrder = await prisma.pendingOrder.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PendingOrders and only return the `id`
     * const pendingOrderWithIdOnly = await prisma.pendingOrder.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PendingOrderCreateManyAndReturnArgs>(args?: SelectSubset<T, PendingOrderCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PendingOrderPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PendingOrder.
     * @param {PendingOrderDeleteArgs} args - Arguments to delete one PendingOrder.
     * @example
     * // Delete one PendingOrder
     * const PendingOrder = await prisma.pendingOrder.delete({
     *   where: {
     *     // ... filter to delete one PendingOrder
     *   }
     * })
     * 
     */
    delete<T extends PendingOrderDeleteArgs>(args: SelectSubset<T, PendingOrderDeleteArgs<ExtArgs>>): Prisma__PendingOrderClient<$Result.GetResult<Prisma.$PendingOrderPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PendingOrder.
     * @param {PendingOrderUpdateArgs} args - Arguments to update one PendingOrder.
     * @example
     * // Update one PendingOrder
     * const pendingOrder = await prisma.pendingOrder.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PendingOrderUpdateArgs>(args: SelectSubset<T, PendingOrderUpdateArgs<ExtArgs>>): Prisma__PendingOrderClient<$Result.GetResult<Prisma.$PendingOrderPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PendingOrders.
     * @param {PendingOrderDeleteManyArgs} args - Arguments to filter PendingOrders to delete.
     * @example
     * // Delete a few PendingOrders
     * const { count } = await prisma.pendingOrder.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PendingOrderDeleteManyArgs>(args?: SelectSubset<T, PendingOrderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PendingOrders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PendingOrderUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PendingOrders
     * const pendingOrder = await prisma.pendingOrder.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PendingOrderUpdateManyArgs>(args: SelectSubset<T, PendingOrderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PendingOrders and returns the data updated in the database.
     * @param {PendingOrderUpdateManyAndReturnArgs} args - Arguments to update many PendingOrders.
     * @example
     * // Update many PendingOrders
     * const pendingOrder = await prisma.pendingOrder.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PendingOrders and only return the `id`
     * const pendingOrderWithIdOnly = await prisma.pendingOrder.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PendingOrderUpdateManyAndReturnArgs>(args: SelectSubset<T, PendingOrderUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PendingOrderPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PendingOrder.
     * @param {PendingOrderUpsertArgs} args - Arguments to update or create a PendingOrder.
     * @example
     * // Update or create a PendingOrder
     * const pendingOrder = await prisma.pendingOrder.upsert({
     *   create: {
     *     // ... data to create a PendingOrder
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PendingOrder we want to update
     *   }
     * })
     */
    upsert<T extends PendingOrderUpsertArgs>(args: SelectSubset<T, PendingOrderUpsertArgs<ExtArgs>>): Prisma__PendingOrderClient<$Result.GetResult<Prisma.$PendingOrderPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PendingOrders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PendingOrderCountArgs} args - Arguments to filter PendingOrders to count.
     * @example
     * // Count the number of PendingOrders
     * const count = await prisma.pendingOrder.count({
     *   where: {
     *     // ... the filter for the PendingOrders we want to count
     *   }
     * })
    **/
    count<T extends PendingOrderCountArgs>(
      args?: Subset<T, PendingOrderCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PendingOrderCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PendingOrder.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PendingOrderAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PendingOrderAggregateArgs>(args: Subset<T, PendingOrderAggregateArgs>): Prisma.PrismaPromise<GetPendingOrderAggregateType<T>>

    /**
     * Group by PendingOrder.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PendingOrderGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PendingOrderGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PendingOrderGroupByArgs['orderBy'] }
        : { orderBy?: PendingOrderGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PendingOrderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPendingOrderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PendingOrder model
   */
  readonly fields: PendingOrderFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PendingOrder.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PendingOrderClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    decision<T extends PendingOrder$decisionArgs<ExtArgs> = {}>(args?: Subset<T, PendingOrder$decisionArgs<ExtArgs>>): Prisma__DecisionLogClient<$Result.GetResult<Prisma.$DecisionLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PendingOrder model
   */
  interface PendingOrderFieldRefs {
    readonly id: FieldRef<"PendingOrder", 'String'>
    readonly ticket: FieldRef<"PendingOrder", 'BigInt'>
    readonly symbol: FieldRef<"PendingOrder", 'String'>
    readonly type: FieldRef<"PendingOrder", 'PendingOrderType'>
    readonly status: FieldRef<"PendingOrder", 'PendingOrderStatus'>
    readonly volume: FieldRef<"PendingOrder", 'Float'>
    readonly price: FieldRef<"PendingOrder", 'Float'>
    readonly stopLoss: FieldRef<"PendingOrder", 'Float'>
    readonly takeProfit: FieldRef<"PendingOrder", 'Float'>
    readonly magic: FieldRef<"PendingOrder", 'Int'>
    readonly strategy: FieldRef<"PendingOrder", 'String'>
    readonly comment: FieldRef<"PendingOrder", 'String'>
    readonly placedAt: FieldRef<"PendingOrder", 'DateTime'>
    readonly expiresAt: FieldRef<"PendingOrder", 'DateTime'>
    readonly triggeredAt: FieldRef<"PendingOrder", 'DateTime'>
    readonly updatedAt: FieldRef<"PendingOrder", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PendingOrder findUnique
   */
  export type PendingOrderFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingOrder
     */
    select?: PendingOrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PendingOrder
     */
    omit?: PendingOrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingOrderInclude<ExtArgs> | null
    /**
     * Filter, which PendingOrder to fetch.
     */
    where: PendingOrderWhereUniqueInput
  }

  /**
   * PendingOrder findUniqueOrThrow
   */
  export type PendingOrderFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingOrder
     */
    select?: PendingOrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PendingOrder
     */
    omit?: PendingOrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingOrderInclude<ExtArgs> | null
    /**
     * Filter, which PendingOrder to fetch.
     */
    where: PendingOrderWhereUniqueInput
  }

  /**
   * PendingOrder findFirst
   */
  export type PendingOrderFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingOrder
     */
    select?: PendingOrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PendingOrder
     */
    omit?: PendingOrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingOrderInclude<ExtArgs> | null
    /**
     * Filter, which PendingOrder to fetch.
     */
    where?: PendingOrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PendingOrders to fetch.
     */
    orderBy?: PendingOrderOrderByWithRelationInput | PendingOrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PendingOrders.
     */
    cursor?: PendingOrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PendingOrders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PendingOrders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PendingOrders.
     */
    distinct?: PendingOrderScalarFieldEnum | PendingOrderScalarFieldEnum[]
  }

  /**
   * PendingOrder findFirstOrThrow
   */
  export type PendingOrderFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingOrder
     */
    select?: PendingOrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PendingOrder
     */
    omit?: PendingOrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingOrderInclude<ExtArgs> | null
    /**
     * Filter, which PendingOrder to fetch.
     */
    where?: PendingOrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PendingOrders to fetch.
     */
    orderBy?: PendingOrderOrderByWithRelationInput | PendingOrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PendingOrders.
     */
    cursor?: PendingOrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PendingOrders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PendingOrders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PendingOrders.
     */
    distinct?: PendingOrderScalarFieldEnum | PendingOrderScalarFieldEnum[]
  }

  /**
   * PendingOrder findMany
   */
  export type PendingOrderFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingOrder
     */
    select?: PendingOrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PendingOrder
     */
    omit?: PendingOrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingOrderInclude<ExtArgs> | null
    /**
     * Filter, which PendingOrders to fetch.
     */
    where?: PendingOrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PendingOrders to fetch.
     */
    orderBy?: PendingOrderOrderByWithRelationInput | PendingOrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PendingOrders.
     */
    cursor?: PendingOrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PendingOrders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PendingOrders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PendingOrders.
     */
    distinct?: PendingOrderScalarFieldEnum | PendingOrderScalarFieldEnum[]
  }

  /**
   * PendingOrder create
   */
  export type PendingOrderCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingOrder
     */
    select?: PendingOrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PendingOrder
     */
    omit?: PendingOrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingOrderInclude<ExtArgs> | null
    /**
     * The data needed to create a PendingOrder.
     */
    data: XOR<PendingOrderCreateInput, PendingOrderUncheckedCreateInput>
  }

  /**
   * PendingOrder createMany
   */
  export type PendingOrderCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PendingOrders.
     */
    data: PendingOrderCreateManyInput | PendingOrderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PendingOrder createManyAndReturn
   */
  export type PendingOrderCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingOrder
     */
    select?: PendingOrderSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PendingOrder
     */
    omit?: PendingOrderOmit<ExtArgs> | null
    /**
     * The data used to create many PendingOrders.
     */
    data: PendingOrderCreateManyInput | PendingOrderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PendingOrder update
   */
  export type PendingOrderUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingOrder
     */
    select?: PendingOrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PendingOrder
     */
    omit?: PendingOrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingOrderInclude<ExtArgs> | null
    /**
     * The data needed to update a PendingOrder.
     */
    data: XOR<PendingOrderUpdateInput, PendingOrderUncheckedUpdateInput>
    /**
     * Choose, which PendingOrder to update.
     */
    where: PendingOrderWhereUniqueInput
  }

  /**
   * PendingOrder updateMany
   */
  export type PendingOrderUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PendingOrders.
     */
    data: XOR<PendingOrderUpdateManyMutationInput, PendingOrderUncheckedUpdateManyInput>
    /**
     * Filter which PendingOrders to update
     */
    where?: PendingOrderWhereInput
    /**
     * Limit how many PendingOrders to update.
     */
    limit?: number
  }

  /**
   * PendingOrder updateManyAndReturn
   */
  export type PendingOrderUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingOrder
     */
    select?: PendingOrderSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PendingOrder
     */
    omit?: PendingOrderOmit<ExtArgs> | null
    /**
     * The data used to update PendingOrders.
     */
    data: XOR<PendingOrderUpdateManyMutationInput, PendingOrderUncheckedUpdateManyInput>
    /**
     * Filter which PendingOrders to update
     */
    where?: PendingOrderWhereInput
    /**
     * Limit how many PendingOrders to update.
     */
    limit?: number
  }

  /**
   * PendingOrder upsert
   */
  export type PendingOrderUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingOrder
     */
    select?: PendingOrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PendingOrder
     */
    omit?: PendingOrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingOrderInclude<ExtArgs> | null
    /**
     * The filter to search for the PendingOrder to update in case it exists.
     */
    where: PendingOrderWhereUniqueInput
    /**
     * In case the PendingOrder found by the `where` argument doesn't exist, create a new PendingOrder with this data.
     */
    create: XOR<PendingOrderCreateInput, PendingOrderUncheckedCreateInput>
    /**
     * In case the PendingOrder was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PendingOrderUpdateInput, PendingOrderUncheckedUpdateInput>
  }

  /**
   * PendingOrder delete
   */
  export type PendingOrderDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingOrder
     */
    select?: PendingOrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PendingOrder
     */
    omit?: PendingOrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingOrderInclude<ExtArgs> | null
    /**
     * Filter which PendingOrder to delete.
     */
    where: PendingOrderWhereUniqueInput
  }

  /**
   * PendingOrder deleteMany
   */
  export type PendingOrderDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PendingOrders to delete
     */
    where?: PendingOrderWhereInput
    /**
     * Limit how many PendingOrders to delete.
     */
    limit?: number
  }

  /**
   * PendingOrder.decision
   */
  export type PendingOrder$decisionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DecisionLog
     */
    select?: DecisionLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DecisionLog
     */
    omit?: DecisionLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DecisionLogInclude<ExtArgs> | null
    where?: DecisionLogWhereInput
  }

  /**
   * PendingOrder without action
   */
  export type PendingOrderDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PendingOrder
     */
    select?: PendingOrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PendingOrder
     */
    omit?: PendingOrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PendingOrderInclude<ExtArgs> | null
  }


  /**
   * Model BotHeartbeat
   */

  export type AggregateBotHeartbeat = {
    _count: BotHeartbeatCountAggregateOutputType | null
    _avg: BotHeartbeatAvgAggregateOutputType | null
    _sum: BotHeartbeatSumAggregateOutputType | null
    _min: BotHeartbeatMinAggregateOutputType | null
    _max: BotHeartbeatMaxAggregateOutputType | null
  }

  export type BotHeartbeatAvgAggregateOutputType = {
    loopCount: number | null
  }

  export type BotHeartbeatSumAggregateOutputType = {
    loopCount: bigint | null
  }

  export type BotHeartbeatMinAggregateOutputType = {
    id: string | null
    lastBeatAt: Date | null
    loopCount: bigint | null
    mode: string | null
    killSwitch: boolean | null
    note: string | null
  }

  export type BotHeartbeatMaxAggregateOutputType = {
    id: string | null
    lastBeatAt: Date | null
    loopCount: bigint | null
    mode: string | null
    killSwitch: boolean | null
    note: string | null
  }

  export type BotHeartbeatCountAggregateOutputType = {
    id: number
    lastBeatAt: number
    loopCount: number
    mode: number
    killSwitch: number
    note: number
    _all: number
  }


  export type BotHeartbeatAvgAggregateInputType = {
    loopCount?: true
  }

  export type BotHeartbeatSumAggregateInputType = {
    loopCount?: true
  }

  export type BotHeartbeatMinAggregateInputType = {
    id?: true
    lastBeatAt?: true
    loopCount?: true
    mode?: true
    killSwitch?: true
    note?: true
  }

  export type BotHeartbeatMaxAggregateInputType = {
    id?: true
    lastBeatAt?: true
    loopCount?: true
    mode?: true
    killSwitch?: true
    note?: true
  }

  export type BotHeartbeatCountAggregateInputType = {
    id?: true
    lastBeatAt?: true
    loopCount?: true
    mode?: true
    killSwitch?: true
    note?: true
    _all?: true
  }

  export type BotHeartbeatAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BotHeartbeat to aggregate.
     */
    where?: BotHeartbeatWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BotHeartbeats to fetch.
     */
    orderBy?: BotHeartbeatOrderByWithRelationInput | BotHeartbeatOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BotHeartbeatWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BotHeartbeats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BotHeartbeats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BotHeartbeats
    **/
    _count?: true | BotHeartbeatCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BotHeartbeatAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BotHeartbeatSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BotHeartbeatMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BotHeartbeatMaxAggregateInputType
  }

  export type GetBotHeartbeatAggregateType<T extends BotHeartbeatAggregateArgs> = {
        [P in keyof T & keyof AggregateBotHeartbeat]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBotHeartbeat[P]>
      : GetScalarType<T[P], AggregateBotHeartbeat[P]>
  }




  export type BotHeartbeatGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BotHeartbeatWhereInput
    orderBy?: BotHeartbeatOrderByWithAggregationInput | BotHeartbeatOrderByWithAggregationInput[]
    by: BotHeartbeatScalarFieldEnum[] | BotHeartbeatScalarFieldEnum
    having?: BotHeartbeatScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BotHeartbeatCountAggregateInputType | true
    _avg?: BotHeartbeatAvgAggregateInputType
    _sum?: BotHeartbeatSumAggregateInputType
    _min?: BotHeartbeatMinAggregateInputType
    _max?: BotHeartbeatMaxAggregateInputType
  }

  export type BotHeartbeatGroupByOutputType = {
    id: string
    lastBeatAt: Date
    loopCount: bigint
    mode: string | null
    killSwitch: boolean
    note: string | null
    _count: BotHeartbeatCountAggregateOutputType | null
    _avg: BotHeartbeatAvgAggregateOutputType | null
    _sum: BotHeartbeatSumAggregateOutputType | null
    _min: BotHeartbeatMinAggregateOutputType | null
    _max: BotHeartbeatMaxAggregateOutputType | null
  }

  type GetBotHeartbeatGroupByPayload<T extends BotHeartbeatGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BotHeartbeatGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BotHeartbeatGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BotHeartbeatGroupByOutputType[P]>
            : GetScalarType<T[P], BotHeartbeatGroupByOutputType[P]>
        }
      >
    >


  export type BotHeartbeatSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    lastBeatAt?: boolean
    loopCount?: boolean
    mode?: boolean
    killSwitch?: boolean
    note?: boolean
  }, ExtArgs["result"]["botHeartbeat"]>

  export type BotHeartbeatSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    lastBeatAt?: boolean
    loopCount?: boolean
    mode?: boolean
    killSwitch?: boolean
    note?: boolean
  }, ExtArgs["result"]["botHeartbeat"]>

  export type BotHeartbeatSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    lastBeatAt?: boolean
    loopCount?: boolean
    mode?: boolean
    killSwitch?: boolean
    note?: boolean
  }, ExtArgs["result"]["botHeartbeat"]>

  export type BotHeartbeatSelectScalar = {
    id?: boolean
    lastBeatAt?: boolean
    loopCount?: boolean
    mode?: boolean
    killSwitch?: boolean
    note?: boolean
  }

  export type BotHeartbeatOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "lastBeatAt" | "loopCount" | "mode" | "killSwitch" | "note", ExtArgs["result"]["botHeartbeat"]>

  export type $BotHeartbeatPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BotHeartbeat"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      lastBeatAt: Date
      loopCount: bigint
      mode: string | null
      killSwitch: boolean
      note: string | null
    }, ExtArgs["result"]["botHeartbeat"]>
    composites: {}
  }

  type BotHeartbeatGetPayload<S extends boolean | null | undefined | BotHeartbeatDefaultArgs> = $Result.GetResult<Prisma.$BotHeartbeatPayload, S>

  type BotHeartbeatCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BotHeartbeatFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BotHeartbeatCountAggregateInputType | true
    }

  export interface BotHeartbeatDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BotHeartbeat'], meta: { name: 'BotHeartbeat' } }
    /**
     * Find zero or one BotHeartbeat that matches the filter.
     * @param {BotHeartbeatFindUniqueArgs} args - Arguments to find a BotHeartbeat
     * @example
     * // Get one BotHeartbeat
     * const botHeartbeat = await prisma.botHeartbeat.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BotHeartbeatFindUniqueArgs>(args: SelectSubset<T, BotHeartbeatFindUniqueArgs<ExtArgs>>): Prisma__BotHeartbeatClient<$Result.GetResult<Prisma.$BotHeartbeatPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one BotHeartbeat that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BotHeartbeatFindUniqueOrThrowArgs} args - Arguments to find a BotHeartbeat
     * @example
     * // Get one BotHeartbeat
     * const botHeartbeat = await prisma.botHeartbeat.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BotHeartbeatFindUniqueOrThrowArgs>(args: SelectSubset<T, BotHeartbeatFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BotHeartbeatClient<$Result.GetResult<Prisma.$BotHeartbeatPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BotHeartbeat that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BotHeartbeatFindFirstArgs} args - Arguments to find a BotHeartbeat
     * @example
     * // Get one BotHeartbeat
     * const botHeartbeat = await prisma.botHeartbeat.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BotHeartbeatFindFirstArgs>(args?: SelectSubset<T, BotHeartbeatFindFirstArgs<ExtArgs>>): Prisma__BotHeartbeatClient<$Result.GetResult<Prisma.$BotHeartbeatPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BotHeartbeat that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BotHeartbeatFindFirstOrThrowArgs} args - Arguments to find a BotHeartbeat
     * @example
     * // Get one BotHeartbeat
     * const botHeartbeat = await prisma.botHeartbeat.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BotHeartbeatFindFirstOrThrowArgs>(args?: SelectSubset<T, BotHeartbeatFindFirstOrThrowArgs<ExtArgs>>): Prisma__BotHeartbeatClient<$Result.GetResult<Prisma.$BotHeartbeatPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more BotHeartbeats that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BotHeartbeatFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BotHeartbeats
     * const botHeartbeats = await prisma.botHeartbeat.findMany()
     * 
     * // Get first 10 BotHeartbeats
     * const botHeartbeats = await prisma.botHeartbeat.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const botHeartbeatWithIdOnly = await prisma.botHeartbeat.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BotHeartbeatFindManyArgs>(args?: SelectSubset<T, BotHeartbeatFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BotHeartbeatPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a BotHeartbeat.
     * @param {BotHeartbeatCreateArgs} args - Arguments to create a BotHeartbeat.
     * @example
     * // Create one BotHeartbeat
     * const BotHeartbeat = await prisma.botHeartbeat.create({
     *   data: {
     *     // ... data to create a BotHeartbeat
     *   }
     * })
     * 
     */
    create<T extends BotHeartbeatCreateArgs>(args: SelectSubset<T, BotHeartbeatCreateArgs<ExtArgs>>): Prisma__BotHeartbeatClient<$Result.GetResult<Prisma.$BotHeartbeatPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many BotHeartbeats.
     * @param {BotHeartbeatCreateManyArgs} args - Arguments to create many BotHeartbeats.
     * @example
     * // Create many BotHeartbeats
     * const botHeartbeat = await prisma.botHeartbeat.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BotHeartbeatCreateManyArgs>(args?: SelectSubset<T, BotHeartbeatCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many BotHeartbeats and returns the data saved in the database.
     * @param {BotHeartbeatCreateManyAndReturnArgs} args - Arguments to create many BotHeartbeats.
     * @example
     * // Create many BotHeartbeats
     * const botHeartbeat = await prisma.botHeartbeat.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many BotHeartbeats and only return the `id`
     * const botHeartbeatWithIdOnly = await prisma.botHeartbeat.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BotHeartbeatCreateManyAndReturnArgs>(args?: SelectSubset<T, BotHeartbeatCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BotHeartbeatPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a BotHeartbeat.
     * @param {BotHeartbeatDeleteArgs} args - Arguments to delete one BotHeartbeat.
     * @example
     * // Delete one BotHeartbeat
     * const BotHeartbeat = await prisma.botHeartbeat.delete({
     *   where: {
     *     // ... filter to delete one BotHeartbeat
     *   }
     * })
     * 
     */
    delete<T extends BotHeartbeatDeleteArgs>(args: SelectSubset<T, BotHeartbeatDeleteArgs<ExtArgs>>): Prisma__BotHeartbeatClient<$Result.GetResult<Prisma.$BotHeartbeatPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one BotHeartbeat.
     * @param {BotHeartbeatUpdateArgs} args - Arguments to update one BotHeartbeat.
     * @example
     * // Update one BotHeartbeat
     * const botHeartbeat = await prisma.botHeartbeat.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BotHeartbeatUpdateArgs>(args: SelectSubset<T, BotHeartbeatUpdateArgs<ExtArgs>>): Prisma__BotHeartbeatClient<$Result.GetResult<Prisma.$BotHeartbeatPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more BotHeartbeats.
     * @param {BotHeartbeatDeleteManyArgs} args - Arguments to filter BotHeartbeats to delete.
     * @example
     * // Delete a few BotHeartbeats
     * const { count } = await prisma.botHeartbeat.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BotHeartbeatDeleteManyArgs>(args?: SelectSubset<T, BotHeartbeatDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BotHeartbeats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BotHeartbeatUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BotHeartbeats
     * const botHeartbeat = await prisma.botHeartbeat.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BotHeartbeatUpdateManyArgs>(args: SelectSubset<T, BotHeartbeatUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BotHeartbeats and returns the data updated in the database.
     * @param {BotHeartbeatUpdateManyAndReturnArgs} args - Arguments to update many BotHeartbeats.
     * @example
     * // Update many BotHeartbeats
     * const botHeartbeat = await prisma.botHeartbeat.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more BotHeartbeats and only return the `id`
     * const botHeartbeatWithIdOnly = await prisma.botHeartbeat.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BotHeartbeatUpdateManyAndReturnArgs>(args: SelectSubset<T, BotHeartbeatUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BotHeartbeatPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one BotHeartbeat.
     * @param {BotHeartbeatUpsertArgs} args - Arguments to update or create a BotHeartbeat.
     * @example
     * // Update or create a BotHeartbeat
     * const botHeartbeat = await prisma.botHeartbeat.upsert({
     *   create: {
     *     // ... data to create a BotHeartbeat
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BotHeartbeat we want to update
     *   }
     * })
     */
    upsert<T extends BotHeartbeatUpsertArgs>(args: SelectSubset<T, BotHeartbeatUpsertArgs<ExtArgs>>): Prisma__BotHeartbeatClient<$Result.GetResult<Prisma.$BotHeartbeatPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of BotHeartbeats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BotHeartbeatCountArgs} args - Arguments to filter BotHeartbeats to count.
     * @example
     * // Count the number of BotHeartbeats
     * const count = await prisma.botHeartbeat.count({
     *   where: {
     *     // ... the filter for the BotHeartbeats we want to count
     *   }
     * })
    **/
    count<T extends BotHeartbeatCountArgs>(
      args?: Subset<T, BotHeartbeatCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BotHeartbeatCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BotHeartbeat.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BotHeartbeatAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BotHeartbeatAggregateArgs>(args: Subset<T, BotHeartbeatAggregateArgs>): Prisma.PrismaPromise<GetBotHeartbeatAggregateType<T>>

    /**
     * Group by BotHeartbeat.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BotHeartbeatGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BotHeartbeatGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BotHeartbeatGroupByArgs['orderBy'] }
        : { orderBy?: BotHeartbeatGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BotHeartbeatGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBotHeartbeatGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BotHeartbeat model
   */
  readonly fields: BotHeartbeatFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BotHeartbeat.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BotHeartbeatClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the BotHeartbeat model
   */
  interface BotHeartbeatFieldRefs {
    readonly id: FieldRef<"BotHeartbeat", 'String'>
    readonly lastBeatAt: FieldRef<"BotHeartbeat", 'DateTime'>
    readonly loopCount: FieldRef<"BotHeartbeat", 'BigInt'>
    readonly mode: FieldRef<"BotHeartbeat", 'String'>
    readonly killSwitch: FieldRef<"BotHeartbeat", 'Boolean'>
    readonly note: FieldRef<"BotHeartbeat", 'String'>
  }
    

  // Custom InputTypes
  /**
   * BotHeartbeat findUnique
   */
  export type BotHeartbeatFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotHeartbeat
     */
    select?: BotHeartbeatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotHeartbeat
     */
    omit?: BotHeartbeatOmit<ExtArgs> | null
    /**
     * Filter, which BotHeartbeat to fetch.
     */
    where: BotHeartbeatWhereUniqueInput
  }

  /**
   * BotHeartbeat findUniqueOrThrow
   */
  export type BotHeartbeatFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotHeartbeat
     */
    select?: BotHeartbeatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotHeartbeat
     */
    omit?: BotHeartbeatOmit<ExtArgs> | null
    /**
     * Filter, which BotHeartbeat to fetch.
     */
    where: BotHeartbeatWhereUniqueInput
  }

  /**
   * BotHeartbeat findFirst
   */
  export type BotHeartbeatFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotHeartbeat
     */
    select?: BotHeartbeatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotHeartbeat
     */
    omit?: BotHeartbeatOmit<ExtArgs> | null
    /**
     * Filter, which BotHeartbeat to fetch.
     */
    where?: BotHeartbeatWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BotHeartbeats to fetch.
     */
    orderBy?: BotHeartbeatOrderByWithRelationInput | BotHeartbeatOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BotHeartbeats.
     */
    cursor?: BotHeartbeatWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BotHeartbeats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BotHeartbeats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BotHeartbeats.
     */
    distinct?: BotHeartbeatScalarFieldEnum | BotHeartbeatScalarFieldEnum[]
  }

  /**
   * BotHeartbeat findFirstOrThrow
   */
  export type BotHeartbeatFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotHeartbeat
     */
    select?: BotHeartbeatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotHeartbeat
     */
    omit?: BotHeartbeatOmit<ExtArgs> | null
    /**
     * Filter, which BotHeartbeat to fetch.
     */
    where?: BotHeartbeatWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BotHeartbeats to fetch.
     */
    orderBy?: BotHeartbeatOrderByWithRelationInput | BotHeartbeatOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BotHeartbeats.
     */
    cursor?: BotHeartbeatWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BotHeartbeats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BotHeartbeats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BotHeartbeats.
     */
    distinct?: BotHeartbeatScalarFieldEnum | BotHeartbeatScalarFieldEnum[]
  }

  /**
   * BotHeartbeat findMany
   */
  export type BotHeartbeatFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotHeartbeat
     */
    select?: BotHeartbeatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotHeartbeat
     */
    omit?: BotHeartbeatOmit<ExtArgs> | null
    /**
     * Filter, which BotHeartbeats to fetch.
     */
    where?: BotHeartbeatWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BotHeartbeats to fetch.
     */
    orderBy?: BotHeartbeatOrderByWithRelationInput | BotHeartbeatOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BotHeartbeats.
     */
    cursor?: BotHeartbeatWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BotHeartbeats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BotHeartbeats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BotHeartbeats.
     */
    distinct?: BotHeartbeatScalarFieldEnum | BotHeartbeatScalarFieldEnum[]
  }

  /**
   * BotHeartbeat create
   */
  export type BotHeartbeatCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotHeartbeat
     */
    select?: BotHeartbeatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotHeartbeat
     */
    omit?: BotHeartbeatOmit<ExtArgs> | null
    /**
     * The data needed to create a BotHeartbeat.
     */
    data: XOR<BotHeartbeatCreateInput, BotHeartbeatUncheckedCreateInput>
  }

  /**
   * BotHeartbeat createMany
   */
  export type BotHeartbeatCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BotHeartbeats.
     */
    data: BotHeartbeatCreateManyInput | BotHeartbeatCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BotHeartbeat createManyAndReturn
   */
  export type BotHeartbeatCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotHeartbeat
     */
    select?: BotHeartbeatSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BotHeartbeat
     */
    omit?: BotHeartbeatOmit<ExtArgs> | null
    /**
     * The data used to create many BotHeartbeats.
     */
    data: BotHeartbeatCreateManyInput | BotHeartbeatCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BotHeartbeat update
   */
  export type BotHeartbeatUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotHeartbeat
     */
    select?: BotHeartbeatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotHeartbeat
     */
    omit?: BotHeartbeatOmit<ExtArgs> | null
    /**
     * The data needed to update a BotHeartbeat.
     */
    data: XOR<BotHeartbeatUpdateInput, BotHeartbeatUncheckedUpdateInput>
    /**
     * Choose, which BotHeartbeat to update.
     */
    where: BotHeartbeatWhereUniqueInput
  }

  /**
   * BotHeartbeat updateMany
   */
  export type BotHeartbeatUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BotHeartbeats.
     */
    data: XOR<BotHeartbeatUpdateManyMutationInput, BotHeartbeatUncheckedUpdateManyInput>
    /**
     * Filter which BotHeartbeats to update
     */
    where?: BotHeartbeatWhereInput
    /**
     * Limit how many BotHeartbeats to update.
     */
    limit?: number
  }

  /**
   * BotHeartbeat updateManyAndReturn
   */
  export type BotHeartbeatUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotHeartbeat
     */
    select?: BotHeartbeatSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BotHeartbeat
     */
    omit?: BotHeartbeatOmit<ExtArgs> | null
    /**
     * The data used to update BotHeartbeats.
     */
    data: XOR<BotHeartbeatUpdateManyMutationInput, BotHeartbeatUncheckedUpdateManyInput>
    /**
     * Filter which BotHeartbeats to update
     */
    where?: BotHeartbeatWhereInput
    /**
     * Limit how many BotHeartbeats to update.
     */
    limit?: number
  }

  /**
   * BotHeartbeat upsert
   */
  export type BotHeartbeatUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotHeartbeat
     */
    select?: BotHeartbeatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotHeartbeat
     */
    omit?: BotHeartbeatOmit<ExtArgs> | null
    /**
     * The filter to search for the BotHeartbeat to update in case it exists.
     */
    where: BotHeartbeatWhereUniqueInput
    /**
     * In case the BotHeartbeat found by the `where` argument doesn't exist, create a new BotHeartbeat with this data.
     */
    create: XOR<BotHeartbeatCreateInput, BotHeartbeatUncheckedCreateInput>
    /**
     * In case the BotHeartbeat was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BotHeartbeatUpdateInput, BotHeartbeatUncheckedUpdateInput>
  }

  /**
   * BotHeartbeat delete
   */
  export type BotHeartbeatDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotHeartbeat
     */
    select?: BotHeartbeatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotHeartbeat
     */
    omit?: BotHeartbeatOmit<ExtArgs> | null
    /**
     * Filter which BotHeartbeat to delete.
     */
    where: BotHeartbeatWhereUniqueInput
  }

  /**
   * BotHeartbeat deleteMany
   */
  export type BotHeartbeatDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BotHeartbeats to delete
     */
    where?: BotHeartbeatWhereInput
    /**
     * Limit how many BotHeartbeats to delete.
     */
    limit?: number
  }

  /**
   * BotHeartbeat without action
   */
  export type BotHeartbeatDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BotHeartbeat
     */
    select?: BotHeartbeatSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BotHeartbeat
     */
    omit?: BotHeartbeatOmit<ExtArgs> | null
  }


  /**
   * Model DailyRiskCounter
   */

  export type AggregateDailyRiskCounter = {
    _count: DailyRiskCounterCountAggregateOutputType | null
    _avg: DailyRiskCounterAvgAggregateOutputType | null
    _sum: DailyRiskCounterSumAggregateOutputType | null
    _min: DailyRiskCounterMinAggregateOutputType | null
    _max: DailyRiskCounterMaxAggregateOutputType | null
  }

  export type DailyRiskCounterAvgAggregateOutputType = {
    realizedPnl: number | null
    tradesOpened: number | null
  }

  export type DailyRiskCounterSumAggregateOutputType = {
    realizedPnl: number | null
    tradesOpened: number | null
  }

  export type DailyRiskCounterMinAggregateOutputType = {
    id: string | null
    date: Date | null
    realizedPnl: number | null
    tradesOpened: number | null
  }

  export type DailyRiskCounterMaxAggregateOutputType = {
    id: string | null
    date: Date | null
    realizedPnl: number | null
    tradesOpened: number | null
  }

  export type DailyRiskCounterCountAggregateOutputType = {
    id: number
    date: number
    realizedPnl: number
    tradesOpened: number
    _all: number
  }


  export type DailyRiskCounterAvgAggregateInputType = {
    realizedPnl?: true
    tradesOpened?: true
  }

  export type DailyRiskCounterSumAggregateInputType = {
    realizedPnl?: true
    tradesOpened?: true
  }

  export type DailyRiskCounterMinAggregateInputType = {
    id?: true
    date?: true
    realizedPnl?: true
    tradesOpened?: true
  }

  export type DailyRiskCounterMaxAggregateInputType = {
    id?: true
    date?: true
    realizedPnl?: true
    tradesOpened?: true
  }

  export type DailyRiskCounterCountAggregateInputType = {
    id?: true
    date?: true
    realizedPnl?: true
    tradesOpened?: true
    _all?: true
  }

  export type DailyRiskCounterAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DailyRiskCounter to aggregate.
     */
    where?: DailyRiskCounterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailyRiskCounters to fetch.
     */
    orderBy?: DailyRiskCounterOrderByWithRelationInput | DailyRiskCounterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DailyRiskCounterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailyRiskCounters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailyRiskCounters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DailyRiskCounters
    **/
    _count?: true | DailyRiskCounterCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DailyRiskCounterAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DailyRiskCounterSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DailyRiskCounterMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DailyRiskCounterMaxAggregateInputType
  }

  export type GetDailyRiskCounterAggregateType<T extends DailyRiskCounterAggregateArgs> = {
        [P in keyof T & keyof AggregateDailyRiskCounter]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDailyRiskCounter[P]>
      : GetScalarType<T[P], AggregateDailyRiskCounter[P]>
  }




  export type DailyRiskCounterGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DailyRiskCounterWhereInput
    orderBy?: DailyRiskCounterOrderByWithAggregationInput | DailyRiskCounterOrderByWithAggregationInput[]
    by: DailyRiskCounterScalarFieldEnum[] | DailyRiskCounterScalarFieldEnum
    having?: DailyRiskCounterScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DailyRiskCounterCountAggregateInputType | true
    _avg?: DailyRiskCounterAvgAggregateInputType
    _sum?: DailyRiskCounterSumAggregateInputType
    _min?: DailyRiskCounterMinAggregateInputType
    _max?: DailyRiskCounterMaxAggregateInputType
  }

  export type DailyRiskCounterGroupByOutputType = {
    id: string
    date: Date
    realizedPnl: number
    tradesOpened: number
    _count: DailyRiskCounterCountAggregateOutputType | null
    _avg: DailyRiskCounterAvgAggregateOutputType | null
    _sum: DailyRiskCounterSumAggregateOutputType | null
    _min: DailyRiskCounterMinAggregateOutputType | null
    _max: DailyRiskCounterMaxAggregateOutputType | null
  }

  type GetDailyRiskCounterGroupByPayload<T extends DailyRiskCounterGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DailyRiskCounterGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DailyRiskCounterGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DailyRiskCounterGroupByOutputType[P]>
            : GetScalarType<T[P], DailyRiskCounterGroupByOutputType[P]>
        }
      >
    >


  export type DailyRiskCounterSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    realizedPnl?: boolean
    tradesOpened?: boolean
  }, ExtArgs["result"]["dailyRiskCounter"]>

  export type DailyRiskCounterSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    realizedPnl?: boolean
    tradesOpened?: boolean
  }, ExtArgs["result"]["dailyRiskCounter"]>

  export type DailyRiskCounterSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    realizedPnl?: boolean
    tradesOpened?: boolean
  }, ExtArgs["result"]["dailyRiskCounter"]>

  export type DailyRiskCounterSelectScalar = {
    id?: boolean
    date?: boolean
    realizedPnl?: boolean
    tradesOpened?: boolean
  }

  export type DailyRiskCounterOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "date" | "realizedPnl" | "tradesOpened", ExtArgs["result"]["dailyRiskCounter"]>

  export type $DailyRiskCounterPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DailyRiskCounter"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      date: Date
      realizedPnl: number
      tradesOpened: number
    }, ExtArgs["result"]["dailyRiskCounter"]>
    composites: {}
  }

  type DailyRiskCounterGetPayload<S extends boolean | null | undefined | DailyRiskCounterDefaultArgs> = $Result.GetResult<Prisma.$DailyRiskCounterPayload, S>

  type DailyRiskCounterCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DailyRiskCounterFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DailyRiskCounterCountAggregateInputType | true
    }

  export interface DailyRiskCounterDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DailyRiskCounter'], meta: { name: 'DailyRiskCounter' } }
    /**
     * Find zero or one DailyRiskCounter that matches the filter.
     * @param {DailyRiskCounterFindUniqueArgs} args - Arguments to find a DailyRiskCounter
     * @example
     * // Get one DailyRiskCounter
     * const dailyRiskCounter = await prisma.dailyRiskCounter.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DailyRiskCounterFindUniqueArgs>(args: SelectSubset<T, DailyRiskCounterFindUniqueArgs<ExtArgs>>): Prisma__DailyRiskCounterClient<$Result.GetResult<Prisma.$DailyRiskCounterPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DailyRiskCounter that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DailyRiskCounterFindUniqueOrThrowArgs} args - Arguments to find a DailyRiskCounter
     * @example
     * // Get one DailyRiskCounter
     * const dailyRiskCounter = await prisma.dailyRiskCounter.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DailyRiskCounterFindUniqueOrThrowArgs>(args: SelectSubset<T, DailyRiskCounterFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DailyRiskCounterClient<$Result.GetResult<Prisma.$DailyRiskCounterPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DailyRiskCounter that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyRiskCounterFindFirstArgs} args - Arguments to find a DailyRiskCounter
     * @example
     * // Get one DailyRiskCounter
     * const dailyRiskCounter = await prisma.dailyRiskCounter.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DailyRiskCounterFindFirstArgs>(args?: SelectSubset<T, DailyRiskCounterFindFirstArgs<ExtArgs>>): Prisma__DailyRiskCounterClient<$Result.GetResult<Prisma.$DailyRiskCounterPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DailyRiskCounter that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyRiskCounterFindFirstOrThrowArgs} args - Arguments to find a DailyRiskCounter
     * @example
     * // Get one DailyRiskCounter
     * const dailyRiskCounter = await prisma.dailyRiskCounter.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DailyRiskCounterFindFirstOrThrowArgs>(args?: SelectSubset<T, DailyRiskCounterFindFirstOrThrowArgs<ExtArgs>>): Prisma__DailyRiskCounterClient<$Result.GetResult<Prisma.$DailyRiskCounterPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DailyRiskCounters that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyRiskCounterFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DailyRiskCounters
     * const dailyRiskCounters = await prisma.dailyRiskCounter.findMany()
     * 
     * // Get first 10 DailyRiskCounters
     * const dailyRiskCounters = await prisma.dailyRiskCounter.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const dailyRiskCounterWithIdOnly = await prisma.dailyRiskCounter.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DailyRiskCounterFindManyArgs>(args?: SelectSubset<T, DailyRiskCounterFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DailyRiskCounterPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DailyRiskCounter.
     * @param {DailyRiskCounterCreateArgs} args - Arguments to create a DailyRiskCounter.
     * @example
     * // Create one DailyRiskCounter
     * const DailyRiskCounter = await prisma.dailyRiskCounter.create({
     *   data: {
     *     // ... data to create a DailyRiskCounter
     *   }
     * })
     * 
     */
    create<T extends DailyRiskCounterCreateArgs>(args: SelectSubset<T, DailyRiskCounterCreateArgs<ExtArgs>>): Prisma__DailyRiskCounterClient<$Result.GetResult<Prisma.$DailyRiskCounterPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DailyRiskCounters.
     * @param {DailyRiskCounterCreateManyArgs} args - Arguments to create many DailyRiskCounters.
     * @example
     * // Create many DailyRiskCounters
     * const dailyRiskCounter = await prisma.dailyRiskCounter.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DailyRiskCounterCreateManyArgs>(args?: SelectSubset<T, DailyRiskCounterCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DailyRiskCounters and returns the data saved in the database.
     * @param {DailyRiskCounterCreateManyAndReturnArgs} args - Arguments to create many DailyRiskCounters.
     * @example
     * // Create many DailyRiskCounters
     * const dailyRiskCounter = await prisma.dailyRiskCounter.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DailyRiskCounters and only return the `id`
     * const dailyRiskCounterWithIdOnly = await prisma.dailyRiskCounter.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DailyRiskCounterCreateManyAndReturnArgs>(args?: SelectSubset<T, DailyRiskCounterCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DailyRiskCounterPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DailyRiskCounter.
     * @param {DailyRiskCounterDeleteArgs} args - Arguments to delete one DailyRiskCounter.
     * @example
     * // Delete one DailyRiskCounter
     * const DailyRiskCounter = await prisma.dailyRiskCounter.delete({
     *   where: {
     *     // ... filter to delete one DailyRiskCounter
     *   }
     * })
     * 
     */
    delete<T extends DailyRiskCounterDeleteArgs>(args: SelectSubset<T, DailyRiskCounterDeleteArgs<ExtArgs>>): Prisma__DailyRiskCounterClient<$Result.GetResult<Prisma.$DailyRiskCounterPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DailyRiskCounter.
     * @param {DailyRiskCounterUpdateArgs} args - Arguments to update one DailyRiskCounter.
     * @example
     * // Update one DailyRiskCounter
     * const dailyRiskCounter = await prisma.dailyRiskCounter.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DailyRiskCounterUpdateArgs>(args: SelectSubset<T, DailyRiskCounterUpdateArgs<ExtArgs>>): Prisma__DailyRiskCounterClient<$Result.GetResult<Prisma.$DailyRiskCounterPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DailyRiskCounters.
     * @param {DailyRiskCounterDeleteManyArgs} args - Arguments to filter DailyRiskCounters to delete.
     * @example
     * // Delete a few DailyRiskCounters
     * const { count } = await prisma.dailyRiskCounter.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DailyRiskCounterDeleteManyArgs>(args?: SelectSubset<T, DailyRiskCounterDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DailyRiskCounters.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyRiskCounterUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DailyRiskCounters
     * const dailyRiskCounter = await prisma.dailyRiskCounter.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DailyRiskCounterUpdateManyArgs>(args: SelectSubset<T, DailyRiskCounterUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DailyRiskCounters and returns the data updated in the database.
     * @param {DailyRiskCounterUpdateManyAndReturnArgs} args - Arguments to update many DailyRiskCounters.
     * @example
     * // Update many DailyRiskCounters
     * const dailyRiskCounter = await prisma.dailyRiskCounter.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DailyRiskCounters and only return the `id`
     * const dailyRiskCounterWithIdOnly = await prisma.dailyRiskCounter.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DailyRiskCounterUpdateManyAndReturnArgs>(args: SelectSubset<T, DailyRiskCounterUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DailyRiskCounterPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DailyRiskCounter.
     * @param {DailyRiskCounterUpsertArgs} args - Arguments to update or create a DailyRiskCounter.
     * @example
     * // Update or create a DailyRiskCounter
     * const dailyRiskCounter = await prisma.dailyRiskCounter.upsert({
     *   create: {
     *     // ... data to create a DailyRiskCounter
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DailyRiskCounter we want to update
     *   }
     * })
     */
    upsert<T extends DailyRiskCounterUpsertArgs>(args: SelectSubset<T, DailyRiskCounterUpsertArgs<ExtArgs>>): Prisma__DailyRiskCounterClient<$Result.GetResult<Prisma.$DailyRiskCounterPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DailyRiskCounters.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyRiskCounterCountArgs} args - Arguments to filter DailyRiskCounters to count.
     * @example
     * // Count the number of DailyRiskCounters
     * const count = await prisma.dailyRiskCounter.count({
     *   where: {
     *     // ... the filter for the DailyRiskCounters we want to count
     *   }
     * })
    **/
    count<T extends DailyRiskCounterCountArgs>(
      args?: Subset<T, DailyRiskCounterCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DailyRiskCounterCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DailyRiskCounter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyRiskCounterAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DailyRiskCounterAggregateArgs>(args: Subset<T, DailyRiskCounterAggregateArgs>): Prisma.PrismaPromise<GetDailyRiskCounterAggregateType<T>>

    /**
     * Group by DailyRiskCounter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DailyRiskCounterGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DailyRiskCounterGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DailyRiskCounterGroupByArgs['orderBy'] }
        : { orderBy?: DailyRiskCounterGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DailyRiskCounterGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDailyRiskCounterGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DailyRiskCounter model
   */
  readonly fields: DailyRiskCounterFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DailyRiskCounter.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DailyRiskCounterClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DailyRiskCounter model
   */
  interface DailyRiskCounterFieldRefs {
    readonly id: FieldRef<"DailyRiskCounter", 'String'>
    readonly date: FieldRef<"DailyRiskCounter", 'DateTime'>
    readonly realizedPnl: FieldRef<"DailyRiskCounter", 'Float'>
    readonly tradesOpened: FieldRef<"DailyRiskCounter", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * DailyRiskCounter findUnique
   */
  export type DailyRiskCounterFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyRiskCounter
     */
    select?: DailyRiskCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyRiskCounter
     */
    omit?: DailyRiskCounterOmit<ExtArgs> | null
    /**
     * Filter, which DailyRiskCounter to fetch.
     */
    where: DailyRiskCounterWhereUniqueInput
  }

  /**
   * DailyRiskCounter findUniqueOrThrow
   */
  export type DailyRiskCounterFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyRiskCounter
     */
    select?: DailyRiskCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyRiskCounter
     */
    omit?: DailyRiskCounterOmit<ExtArgs> | null
    /**
     * Filter, which DailyRiskCounter to fetch.
     */
    where: DailyRiskCounterWhereUniqueInput
  }

  /**
   * DailyRiskCounter findFirst
   */
  export type DailyRiskCounterFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyRiskCounter
     */
    select?: DailyRiskCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyRiskCounter
     */
    omit?: DailyRiskCounterOmit<ExtArgs> | null
    /**
     * Filter, which DailyRiskCounter to fetch.
     */
    where?: DailyRiskCounterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailyRiskCounters to fetch.
     */
    orderBy?: DailyRiskCounterOrderByWithRelationInput | DailyRiskCounterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DailyRiskCounters.
     */
    cursor?: DailyRiskCounterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailyRiskCounters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailyRiskCounters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DailyRiskCounters.
     */
    distinct?: DailyRiskCounterScalarFieldEnum | DailyRiskCounterScalarFieldEnum[]
  }

  /**
   * DailyRiskCounter findFirstOrThrow
   */
  export type DailyRiskCounterFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyRiskCounter
     */
    select?: DailyRiskCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyRiskCounter
     */
    omit?: DailyRiskCounterOmit<ExtArgs> | null
    /**
     * Filter, which DailyRiskCounter to fetch.
     */
    where?: DailyRiskCounterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailyRiskCounters to fetch.
     */
    orderBy?: DailyRiskCounterOrderByWithRelationInput | DailyRiskCounterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DailyRiskCounters.
     */
    cursor?: DailyRiskCounterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailyRiskCounters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailyRiskCounters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DailyRiskCounters.
     */
    distinct?: DailyRiskCounterScalarFieldEnum | DailyRiskCounterScalarFieldEnum[]
  }

  /**
   * DailyRiskCounter findMany
   */
  export type DailyRiskCounterFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyRiskCounter
     */
    select?: DailyRiskCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyRiskCounter
     */
    omit?: DailyRiskCounterOmit<ExtArgs> | null
    /**
     * Filter, which DailyRiskCounters to fetch.
     */
    where?: DailyRiskCounterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DailyRiskCounters to fetch.
     */
    orderBy?: DailyRiskCounterOrderByWithRelationInput | DailyRiskCounterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DailyRiskCounters.
     */
    cursor?: DailyRiskCounterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DailyRiskCounters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DailyRiskCounters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DailyRiskCounters.
     */
    distinct?: DailyRiskCounterScalarFieldEnum | DailyRiskCounterScalarFieldEnum[]
  }

  /**
   * DailyRiskCounter create
   */
  export type DailyRiskCounterCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyRiskCounter
     */
    select?: DailyRiskCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyRiskCounter
     */
    omit?: DailyRiskCounterOmit<ExtArgs> | null
    /**
     * The data needed to create a DailyRiskCounter.
     */
    data?: XOR<DailyRiskCounterCreateInput, DailyRiskCounterUncheckedCreateInput>
  }

  /**
   * DailyRiskCounter createMany
   */
  export type DailyRiskCounterCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DailyRiskCounters.
     */
    data: DailyRiskCounterCreateManyInput | DailyRiskCounterCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DailyRiskCounter createManyAndReturn
   */
  export type DailyRiskCounterCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyRiskCounter
     */
    select?: DailyRiskCounterSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DailyRiskCounter
     */
    omit?: DailyRiskCounterOmit<ExtArgs> | null
    /**
     * The data used to create many DailyRiskCounters.
     */
    data: DailyRiskCounterCreateManyInput | DailyRiskCounterCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DailyRiskCounter update
   */
  export type DailyRiskCounterUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyRiskCounter
     */
    select?: DailyRiskCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyRiskCounter
     */
    omit?: DailyRiskCounterOmit<ExtArgs> | null
    /**
     * The data needed to update a DailyRiskCounter.
     */
    data: XOR<DailyRiskCounterUpdateInput, DailyRiskCounterUncheckedUpdateInput>
    /**
     * Choose, which DailyRiskCounter to update.
     */
    where: DailyRiskCounterWhereUniqueInput
  }

  /**
   * DailyRiskCounter updateMany
   */
  export type DailyRiskCounterUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DailyRiskCounters.
     */
    data: XOR<DailyRiskCounterUpdateManyMutationInput, DailyRiskCounterUncheckedUpdateManyInput>
    /**
     * Filter which DailyRiskCounters to update
     */
    where?: DailyRiskCounterWhereInput
    /**
     * Limit how many DailyRiskCounters to update.
     */
    limit?: number
  }

  /**
   * DailyRiskCounter updateManyAndReturn
   */
  export type DailyRiskCounterUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyRiskCounter
     */
    select?: DailyRiskCounterSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DailyRiskCounter
     */
    omit?: DailyRiskCounterOmit<ExtArgs> | null
    /**
     * The data used to update DailyRiskCounters.
     */
    data: XOR<DailyRiskCounterUpdateManyMutationInput, DailyRiskCounterUncheckedUpdateManyInput>
    /**
     * Filter which DailyRiskCounters to update
     */
    where?: DailyRiskCounterWhereInput
    /**
     * Limit how many DailyRiskCounters to update.
     */
    limit?: number
  }

  /**
   * DailyRiskCounter upsert
   */
  export type DailyRiskCounterUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyRiskCounter
     */
    select?: DailyRiskCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyRiskCounter
     */
    omit?: DailyRiskCounterOmit<ExtArgs> | null
    /**
     * The filter to search for the DailyRiskCounter to update in case it exists.
     */
    where: DailyRiskCounterWhereUniqueInput
    /**
     * In case the DailyRiskCounter found by the `where` argument doesn't exist, create a new DailyRiskCounter with this data.
     */
    create: XOR<DailyRiskCounterCreateInput, DailyRiskCounterUncheckedCreateInput>
    /**
     * In case the DailyRiskCounter was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DailyRiskCounterUpdateInput, DailyRiskCounterUncheckedUpdateInput>
  }

  /**
   * DailyRiskCounter delete
   */
  export type DailyRiskCounterDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyRiskCounter
     */
    select?: DailyRiskCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyRiskCounter
     */
    omit?: DailyRiskCounterOmit<ExtArgs> | null
    /**
     * Filter which DailyRiskCounter to delete.
     */
    where: DailyRiskCounterWhereUniqueInput
  }

  /**
   * DailyRiskCounter deleteMany
   */
  export type DailyRiskCounterDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DailyRiskCounters to delete
     */
    where?: DailyRiskCounterWhereInput
    /**
     * Limit how many DailyRiskCounters to delete.
     */
    limit?: number
  }

  /**
   * DailyRiskCounter without action
   */
  export type DailyRiskCounterDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DailyRiskCounter
     */
    select?: DailyRiskCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DailyRiskCounter
     */
    omit?: DailyRiskCounterOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const TradeScalarFieldEnum: {
    id: 'id',
    ticket: 'ticket',
    symbol: 'symbol',
    side: 'side',
    volume: 'volume',
    openPrice: 'openPrice',
    closePrice: 'closePrice',
    stopLoss: 'stopLoss',
    takeProfit: 'takeProfit',
    commission: 'commission',
    swap: 'swap',
    grossProfit: 'grossProfit',
    netProfit: 'netProfit',
    pips: 'pips',
    strategy: 'strategy',
    magic: 'magic',
    comment: 'comment',
    status: 'status',
    openedAt: 'openedAt',
    closedAt: 'closedAt',
    createdAt: 'createdAt'
  };

  export type TradeScalarFieldEnum = (typeof TradeScalarFieldEnum)[keyof typeof TradeScalarFieldEnum]


  export const PositionScalarFieldEnum: {
    id: 'id',
    ticket: 'ticket',
    symbol: 'symbol',
    side: 'side',
    volume: 'volume',
    openPrice: 'openPrice',
    currentPrice: 'currentPrice',
    stopLoss: 'stopLoss',
    takeProfit: 'takeProfit',
    swap: 'swap',
    commission: 'commission',
    unrealizedProfit: 'unrealizedProfit',
    openedAt: 'openedAt',
    updatedAt: 'updatedAt'
  };

  export type PositionScalarFieldEnum = (typeof PositionScalarFieldEnum)[keyof typeof PositionScalarFieldEnum]


  export const SignalScalarFieldEnum: {
    id: 'id',
    symbol: 'symbol',
    timeframe: 'timeframe',
    direction: 'direction',
    score: 'score',
    acted: 'acted',
    indicators: 'indicators',
    evaluation: 'evaluation',
    generatedAt: 'generatedAt'
  };

  export type SignalScalarFieldEnum = (typeof SignalScalarFieldEnum)[keyof typeof SignalScalarFieldEnum]


  export const AccountSnapshotScalarFieldEnum: {
    id: 'id',
    balance: 'balance',
    equity: 'equity',
    margin: 'margin',
    freeMargin: 'freeMargin',
    marginLevel: 'marginLevel',
    currency: 'currency',
    leverage: 'leverage',
    capturedAt: 'capturedAt'
  };

  export type AccountSnapshotScalarFieldEnum = (typeof AccountSnapshotScalarFieldEnum)[keyof typeof AccountSnapshotScalarFieldEnum]


  export const RiskSnapshotScalarFieldEnum: {
    id: 'id',
    dailyPnl: 'dailyPnl',
    dailyDrawdownPct: 'dailyDrawdownPct',
    maxDrawdownPct: 'maxDrawdownPct',
    openRiskPct: 'openRiskPct',
    exposurePct: 'exposurePct',
    riskPerTradePct: 'riskPerTradePct',
    openPositions: 'openPositions',
    marginLevel: 'marginLevel',
    capturedAt: 'capturedAt'
  };

  export type RiskSnapshotScalarFieldEnum = (typeof RiskSnapshotScalarFieldEnum)[keyof typeof RiskSnapshotScalarFieldEnum]


  export const MarketCandleScalarFieldEnum: {
    id: 'id',
    symbol: 'symbol',
    timeframe: 'timeframe',
    openTime: 'openTime',
    open: 'open',
    high: 'high',
    low: 'low',
    close: 'close',
    volume: 'volume',
    spread: 'spread'
  };

  export type MarketCandleScalarFieldEnum = (typeof MarketCandleScalarFieldEnum)[keyof typeof MarketCandleScalarFieldEnum]


  export const LogEntryScalarFieldEnum: {
    id: 'id',
    level: 'level',
    logger: 'logger',
    message: 'message',
    context: 'context',
    createdAt: 'createdAt'
  };

  export type LogEntryScalarFieldEnum = (typeof LogEntryScalarFieldEnum)[keyof typeof LogEntryScalarFieldEnum]


  export const JournalEntryScalarFieldEnum: {
    id: 'id',
    entryType: 'entryType',
    symbol: 'symbol',
    title: 'title',
    content: 'content',
    createdAt: 'createdAt'
  };

  export type JournalEntryScalarFieldEnum = (typeof JournalEntryScalarFieldEnum)[keyof typeof JournalEntryScalarFieldEnum]


  export const NotificationScalarFieldEnum: {
    id: 'id',
    channel: 'channel',
    level: 'level',
    title: 'title',
    body: 'body',
    status: 'status',
    sentAt: 'sentAt',
    createdAt: 'createdAt'
  };

  export type NotificationScalarFieldEnum = (typeof NotificationScalarFieldEnum)[keyof typeof NotificationScalarFieldEnum]


  export const BotStateScalarFieldEnum: {
    id: 'id',
    mode: 'mode',
    killSwitch: 'killSwitch',
    activeStrategy: 'activeStrategy',
    maxOpenTrades: 'maxOpenTrades',
    maxDailyLossPct: 'maxDailyLossPct',
    note: 'note',
    updatedBy: 'updatedBy',
    updatedAt: 'updatedAt',
    createdAt: 'createdAt'
  };

  export type BotStateScalarFieldEnum = (typeof BotStateScalarFieldEnum)[keyof typeof BotStateScalarFieldEnum]


  export const SessionWindowScalarFieldEnum: {
    id: 'id',
    sessionName: 'sessionName',
    startMinuteUtc: 'startMinuteUtc',
    endMinuteUtc: 'endMinuteUtc',
    enabled: 'enabled',
    tradingEnabled: 'tradingEnabled',
    symbols: 'symbols',
    note: 'note',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SessionWindowScalarFieldEnum = (typeof SessionWindowScalarFieldEnum)[keyof typeof SessionWindowScalarFieldEnum]


  export const DecisionLogScalarFieldEnum: {
    id: 'id',
    symbol: 'symbol',
    timeframe: 'timeframe',
    action: 'action',
    status: 'status',
    model: 'model',
    inputPrompt: 'inputPrompt',
    outputDecision: 'outputDecision',
    rationale: 'rationale',
    confidenceScore: 'confidenceScore',
    proposedSl: 'proposedSl',
    proposedTp: 'proposedTp',
    proposedVolume: 'proposedVolume',
    latencyMs: 'latencyMs',
    error: 'error',
    signalId: 'signalId',
    sessionWindowId: 'sessionWindowId',
    pendingOrderId: 'pendingOrderId',
    tradeId: 'tradeId',
    createdAt: 'createdAt'
  };

  export type DecisionLogScalarFieldEnum = (typeof DecisionLogScalarFieldEnum)[keyof typeof DecisionLogScalarFieldEnum]


  export const PendingOrderScalarFieldEnum: {
    id: 'id',
    ticket: 'ticket',
    symbol: 'symbol',
    type: 'type',
    status: 'status',
    volume: 'volume',
    price: 'price',
    stopLoss: 'stopLoss',
    takeProfit: 'takeProfit',
    magic: 'magic',
    strategy: 'strategy',
    comment: 'comment',
    placedAt: 'placedAt',
    expiresAt: 'expiresAt',
    triggeredAt: 'triggeredAt',
    updatedAt: 'updatedAt'
  };

  export type PendingOrderScalarFieldEnum = (typeof PendingOrderScalarFieldEnum)[keyof typeof PendingOrderScalarFieldEnum]


  export const BotHeartbeatScalarFieldEnum: {
    id: 'id',
    lastBeatAt: 'lastBeatAt',
    loopCount: 'loopCount',
    mode: 'mode',
    killSwitch: 'killSwitch',
    note: 'note'
  };

  export type BotHeartbeatScalarFieldEnum = (typeof BotHeartbeatScalarFieldEnum)[keyof typeof BotHeartbeatScalarFieldEnum]


  export const DailyRiskCounterScalarFieldEnum: {
    id: 'id',
    date: 'date',
    realizedPnl: 'realizedPnl',
    tradesOpened: 'tradesOpened'
  };

  export type DailyRiskCounterScalarFieldEnum = (typeof DailyRiskCounterScalarFieldEnum)[keyof typeof DailyRiskCounterScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'BigInt'
   */
  export type BigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt'>
    


  /**
   * Reference to a field of type 'BigInt[]'
   */
  export type ListBigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt[]'>
    


  /**
   * Reference to a field of type 'TradeSide'
   */
  export type EnumTradeSideFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TradeSide'>
    


  /**
   * Reference to a field of type 'TradeSide[]'
   */
  export type ListEnumTradeSideFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TradeSide[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'TradeStatus'
   */
  export type EnumTradeStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TradeStatus'>
    


  /**
   * Reference to a field of type 'TradeStatus[]'
   */
  export type ListEnumTradeStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TradeStatus[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'SignalDirection'
   */
  export type EnumSignalDirectionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SignalDirection'>
    


  /**
   * Reference to a field of type 'SignalDirection[]'
   */
  export type ListEnumSignalDirectionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SignalDirection[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'LogLevel'
   */
  export type EnumLogLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LogLevel'>
    


  /**
   * Reference to a field of type 'LogLevel[]'
   */
  export type ListEnumLogLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LogLevel[]'>
    


  /**
   * Reference to a field of type 'NotificationStatus'
   */
  export type EnumNotificationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'NotificationStatus'>
    


  /**
   * Reference to a field of type 'NotificationStatus[]'
   */
  export type ListEnumNotificationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'NotificationStatus[]'>
    


  /**
   * Reference to a field of type 'BotMode'
   */
  export type EnumBotModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BotMode'>
    


  /**
   * Reference to a field of type 'BotMode[]'
   */
  export type ListEnumBotModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BotMode[]'>
    


  /**
   * Reference to a field of type 'DecisionAction'
   */
  export type EnumDecisionActionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DecisionAction'>
    


  /**
   * Reference to a field of type 'DecisionAction[]'
   */
  export type ListEnumDecisionActionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DecisionAction[]'>
    


  /**
   * Reference to a field of type 'DecisionStatus'
   */
  export type EnumDecisionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DecisionStatus'>
    


  /**
   * Reference to a field of type 'DecisionStatus[]'
   */
  export type ListEnumDecisionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DecisionStatus[]'>
    


  /**
   * Reference to a field of type 'PendingOrderType'
   */
  export type EnumPendingOrderTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PendingOrderType'>
    


  /**
   * Reference to a field of type 'PendingOrderType[]'
   */
  export type ListEnumPendingOrderTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PendingOrderType[]'>
    


  /**
   * Reference to a field of type 'PendingOrderStatus'
   */
  export type EnumPendingOrderStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PendingOrderStatus'>
    


  /**
   * Reference to a field of type 'PendingOrderStatus[]'
   */
  export type ListEnumPendingOrderStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PendingOrderStatus[]'>
    
  /**
   * Deep Input Types
   */


  export type TradeWhereInput = {
    AND?: TradeWhereInput | TradeWhereInput[]
    OR?: TradeWhereInput[]
    NOT?: TradeWhereInput | TradeWhereInput[]
    id?: StringFilter<"Trade"> | string
    ticket?: BigIntFilter<"Trade"> | bigint | number
    symbol?: StringFilter<"Trade"> | string
    side?: EnumTradeSideFilter<"Trade"> | $Enums.TradeSide
    volume?: FloatFilter<"Trade"> | number
    openPrice?: FloatFilter<"Trade"> | number
    closePrice?: FloatNullableFilter<"Trade"> | number | null
    stopLoss?: FloatNullableFilter<"Trade"> | number | null
    takeProfit?: FloatNullableFilter<"Trade"> | number | null
    commission?: FloatFilter<"Trade"> | number
    swap?: FloatFilter<"Trade"> | number
    grossProfit?: FloatFilter<"Trade"> | number
    netProfit?: FloatFilter<"Trade"> | number
    pips?: FloatNullableFilter<"Trade"> | number | null
    strategy?: StringNullableFilter<"Trade"> | string | null
    magic?: IntNullableFilter<"Trade"> | number | null
    comment?: StringNullableFilter<"Trade"> | string | null
    status?: EnumTradeStatusFilter<"Trade"> | $Enums.TradeStatus
    openedAt?: DateTimeFilter<"Trade"> | Date | string
    closedAt?: DateTimeNullableFilter<"Trade"> | Date | string | null
    createdAt?: DateTimeFilter<"Trade"> | Date | string
    decisions?: DecisionLogListRelationFilter
  }

  export type TradeOrderByWithRelationInput = {
    id?: SortOrder
    ticket?: SortOrder
    symbol?: SortOrder
    side?: SortOrder
    volume?: SortOrder
    openPrice?: SortOrder
    closePrice?: SortOrderInput | SortOrder
    stopLoss?: SortOrderInput | SortOrder
    takeProfit?: SortOrderInput | SortOrder
    commission?: SortOrder
    swap?: SortOrder
    grossProfit?: SortOrder
    netProfit?: SortOrder
    pips?: SortOrderInput | SortOrder
    strategy?: SortOrderInput | SortOrder
    magic?: SortOrderInput | SortOrder
    comment?: SortOrderInput | SortOrder
    status?: SortOrder
    openedAt?: SortOrder
    closedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    decisions?: DecisionLogOrderByRelationAggregateInput
  }

  export type TradeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    ticket?: bigint | number
    AND?: TradeWhereInput | TradeWhereInput[]
    OR?: TradeWhereInput[]
    NOT?: TradeWhereInput | TradeWhereInput[]
    symbol?: StringFilter<"Trade"> | string
    side?: EnumTradeSideFilter<"Trade"> | $Enums.TradeSide
    volume?: FloatFilter<"Trade"> | number
    openPrice?: FloatFilter<"Trade"> | number
    closePrice?: FloatNullableFilter<"Trade"> | number | null
    stopLoss?: FloatNullableFilter<"Trade"> | number | null
    takeProfit?: FloatNullableFilter<"Trade"> | number | null
    commission?: FloatFilter<"Trade"> | number
    swap?: FloatFilter<"Trade"> | number
    grossProfit?: FloatFilter<"Trade"> | number
    netProfit?: FloatFilter<"Trade"> | number
    pips?: FloatNullableFilter<"Trade"> | number | null
    strategy?: StringNullableFilter<"Trade"> | string | null
    magic?: IntNullableFilter<"Trade"> | number | null
    comment?: StringNullableFilter<"Trade"> | string | null
    status?: EnumTradeStatusFilter<"Trade"> | $Enums.TradeStatus
    openedAt?: DateTimeFilter<"Trade"> | Date | string
    closedAt?: DateTimeNullableFilter<"Trade"> | Date | string | null
    createdAt?: DateTimeFilter<"Trade"> | Date | string
    decisions?: DecisionLogListRelationFilter
  }, "id" | "ticket">

  export type TradeOrderByWithAggregationInput = {
    id?: SortOrder
    ticket?: SortOrder
    symbol?: SortOrder
    side?: SortOrder
    volume?: SortOrder
    openPrice?: SortOrder
    closePrice?: SortOrderInput | SortOrder
    stopLoss?: SortOrderInput | SortOrder
    takeProfit?: SortOrderInput | SortOrder
    commission?: SortOrder
    swap?: SortOrder
    grossProfit?: SortOrder
    netProfit?: SortOrder
    pips?: SortOrderInput | SortOrder
    strategy?: SortOrderInput | SortOrder
    magic?: SortOrderInput | SortOrder
    comment?: SortOrderInput | SortOrder
    status?: SortOrder
    openedAt?: SortOrder
    closedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: TradeCountOrderByAggregateInput
    _avg?: TradeAvgOrderByAggregateInput
    _max?: TradeMaxOrderByAggregateInput
    _min?: TradeMinOrderByAggregateInput
    _sum?: TradeSumOrderByAggregateInput
  }

  export type TradeScalarWhereWithAggregatesInput = {
    AND?: TradeScalarWhereWithAggregatesInput | TradeScalarWhereWithAggregatesInput[]
    OR?: TradeScalarWhereWithAggregatesInput[]
    NOT?: TradeScalarWhereWithAggregatesInput | TradeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Trade"> | string
    ticket?: BigIntWithAggregatesFilter<"Trade"> | bigint | number
    symbol?: StringWithAggregatesFilter<"Trade"> | string
    side?: EnumTradeSideWithAggregatesFilter<"Trade"> | $Enums.TradeSide
    volume?: FloatWithAggregatesFilter<"Trade"> | number
    openPrice?: FloatWithAggregatesFilter<"Trade"> | number
    closePrice?: FloatNullableWithAggregatesFilter<"Trade"> | number | null
    stopLoss?: FloatNullableWithAggregatesFilter<"Trade"> | number | null
    takeProfit?: FloatNullableWithAggregatesFilter<"Trade"> | number | null
    commission?: FloatWithAggregatesFilter<"Trade"> | number
    swap?: FloatWithAggregatesFilter<"Trade"> | number
    grossProfit?: FloatWithAggregatesFilter<"Trade"> | number
    netProfit?: FloatWithAggregatesFilter<"Trade"> | number
    pips?: FloatNullableWithAggregatesFilter<"Trade"> | number | null
    strategy?: StringNullableWithAggregatesFilter<"Trade"> | string | null
    magic?: IntNullableWithAggregatesFilter<"Trade"> | number | null
    comment?: StringNullableWithAggregatesFilter<"Trade"> | string | null
    status?: EnumTradeStatusWithAggregatesFilter<"Trade"> | $Enums.TradeStatus
    openedAt?: DateTimeWithAggregatesFilter<"Trade"> | Date | string
    closedAt?: DateTimeNullableWithAggregatesFilter<"Trade"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Trade"> | Date | string
  }

  export type PositionWhereInput = {
    AND?: PositionWhereInput | PositionWhereInput[]
    OR?: PositionWhereInput[]
    NOT?: PositionWhereInput | PositionWhereInput[]
    id?: StringFilter<"Position"> | string
    ticket?: BigIntFilter<"Position"> | bigint | number
    symbol?: StringFilter<"Position"> | string
    side?: EnumTradeSideFilter<"Position"> | $Enums.TradeSide
    volume?: FloatFilter<"Position"> | number
    openPrice?: FloatFilter<"Position"> | number
    currentPrice?: FloatFilter<"Position"> | number
    stopLoss?: FloatNullableFilter<"Position"> | number | null
    takeProfit?: FloatNullableFilter<"Position"> | number | null
    swap?: FloatFilter<"Position"> | number
    commission?: FloatFilter<"Position"> | number
    unrealizedProfit?: FloatFilter<"Position"> | number
    openedAt?: DateTimeFilter<"Position"> | Date | string
    updatedAt?: DateTimeFilter<"Position"> | Date | string
  }

  export type PositionOrderByWithRelationInput = {
    id?: SortOrder
    ticket?: SortOrder
    symbol?: SortOrder
    side?: SortOrder
    volume?: SortOrder
    openPrice?: SortOrder
    currentPrice?: SortOrder
    stopLoss?: SortOrderInput | SortOrder
    takeProfit?: SortOrderInput | SortOrder
    swap?: SortOrder
    commission?: SortOrder
    unrealizedProfit?: SortOrder
    openedAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PositionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    ticket?: bigint | number
    AND?: PositionWhereInput | PositionWhereInput[]
    OR?: PositionWhereInput[]
    NOT?: PositionWhereInput | PositionWhereInput[]
    symbol?: StringFilter<"Position"> | string
    side?: EnumTradeSideFilter<"Position"> | $Enums.TradeSide
    volume?: FloatFilter<"Position"> | number
    openPrice?: FloatFilter<"Position"> | number
    currentPrice?: FloatFilter<"Position"> | number
    stopLoss?: FloatNullableFilter<"Position"> | number | null
    takeProfit?: FloatNullableFilter<"Position"> | number | null
    swap?: FloatFilter<"Position"> | number
    commission?: FloatFilter<"Position"> | number
    unrealizedProfit?: FloatFilter<"Position"> | number
    openedAt?: DateTimeFilter<"Position"> | Date | string
    updatedAt?: DateTimeFilter<"Position"> | Date | string
  }, "id" | "ticket">

  export type PositionOrderByWithAggregationInput = {
    id?: SortOrder
    ticket?: SortOrder
    symbol?: SortOrder
    side?: SortOrder
    volume?: SortOrder
    openPrice?: SortOrder
    currentPrice?: SortOrder
    stopLoss?: SortOrderInput | SortOrder
    takeProfit?: SortOrderInput | SortOrder
    swap?: SortOrder
    commission?: SortOrder
    unrealizedProfit?: SortOrder
    openedAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PositionCountOrderByAggregateInput
    _avg?: PositionAvgOrderByAggregateInput
    _max?: PositionMaxOrderByAggregateInput
    _min?: PositionMinOrderByAggregateInput
    _sum?: PositionSumOrderByAggregateInput
  }

  export type PositionScalarWhereWithAggregatesInput = {
    AND?: PositionScalarWhereWithAggregatesInput | PositionScalarWhereWithAggregatesInput[]
    OR?: PositionScalarWhereWithAggregatesInput[]
    NOT?: PositionScalarWhereWithAggregatesInput | PositionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Position"> | string
    ticket?: BigIntWithAggregatesFilter<"Position"> | bigint | number
    symbol?: StringWithAggregatesFilter<"Position"> | string
    side?: EnumTradeSideWithAggregatesFilter<"Position"> | $Enums.TradeSide
    volume?: FloatWithAggregatesFilter<"Position"> | number
    openPrice?: FloatWithAggregatesFilter<"Position"> | number
    currentPrice?: FloatWithAggregatesFilter<"Position"> | number
    stopLoss?: FloatNullableWithAggregatesFilter<"Position"> | number | null
    takeProfit?: FloatNullableWithAggregatesFilter<"Position"> | number | null
    swap?: FloatWithAggregatesFilter<"Position"> | number
    commission?: FloatWithAggregatesFilter<"Position"> | number
    unrealizedProfit?: FloatWithAggregatesFilter<"Position"> | number
    openedAt?: DateTimeWithAggregatesFilter<"Position"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Position"> | Date | string
  }

  export type SignalWhereInput = {
    AND?: SignalWhereInput | SignalWhereInput[]
    OR?: SignalWhereInput[]
    NOT?: SignalWhereInput | SignalWhereInput[]
    id?: StringFilter<"Signal"> | string
    symbol?: StringFilter<"Signal"> | string
    timeframe?: StringFilter<"Signal"> | string
    direction?: EnumSignalDirectionFilter<"Signal"> | $Enums.SignalDirection
    score?: FloatFilter<"Signal"> | number
    acted?: BoolFilter<"Signal"> | boolean
    indicators?: JsonNullableFilter<"Signal">
    evaluation?: JsonNullableFilter<"Signal">
    generatedAt?: DateTimeFilter<"Signal"> | Date | string
    decisions?: DecisionLogListRelationFilter
  }

  export type SignalOrderByWithRelationInput = {
    id?: SortOrder
    symbol?: SortOrder
    timeframe?: SortOrder
    direction?: SortOrder
    score?: SortOrder
    acted?: SortOrder
    indicators?: SortOrderInput | SortOrder
    evaluation?: SortOrderInput | SortOrder
    generatedAt?: SortOrder
    decisions?: DecisionLogOrderByRelationAggregateInput
  }

  export type SignalWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SignalWhereInput | SignalWhereInput[]
    OR?: SignalWhereInput[]
    NOT?: SignalWhereInput | SignalWhereInput[]
    symbol?: StringFilter<"Signal"> | string
    timeframe?: StringFilter<"Signal"> | string
    direction?: EnumSignalDirectionFilter<"Signal"> | $Enums.SignalDirection
    score?: FloatFilter<"Signal"> | number
    acted?: BoolFilter<"Signal"> | boolean
    indicators?: JsonNullableFilter<"Signal">
    evaluation?: JsonNullableFilter<"Signal">
    generatedAt?: DateTimeFilter<"Signal"> | Date | string
    decisions?: DecisionLogListRelationFilter
  }, "id">

  export type SignalOrderByWithAggregationInput = {
    id?: SortOrder
    symbol?: SortOrder
    timeframe?: SortOrder
    direction?: SortOrder
    score?: SortOrder
    acted?: SortOrder
    indicators?: SortOrderInput | SortOrder
    evaluation?: SortOrderInput | SortOrder
    generatedAt?: SortOrder
    _count?: SignalCountOrderByAggregateInput
    _avg?: SignalAvgOrderByAggregateInput
    _max?: SignalMaxOrderByAggregateInput
    _min?: SignalMinOrderByAggregateInput
    _sum?: SignalSumOrderByAggregateInput
  }

  export type SignalScalarWhereWithAggregatesInput = {
    AND?: SignalScalarWhereWithAggregatesInput | SignalScalarWhereWithAggregatesInput[]
    OR?: SignalScalarWhereWithAggregatesInput[]
    NOT?: SignalScalarWhereWithAggregatesInput | SignalScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Signal"> | string
    symbol?: StringWithAggregatesFilter<"Signal"> | string
    timeframe?: StringWithAggregatesFilter<"Signal"> | string
    direction?: EnumSignalDirectionWithAggregatesFilter<"Signal"> | $Enums.SignalDirection
    score?: FloatWithAggregatesFilter<"Signal"> | number
    acted?: BoolWithAggregatesFilter<"Signal"> | boolean
    indicators?: JsonNullableWithAggregatesFilter<"Signal">
    evaluation?: JsonNullableWithAggregatesFilter<"Signal">
    generatedAt?: DateTimeWithAggregatesFilter<"Signal"> | Date | string
  }

  export type AccountSnapshotWhereInput = {
    AND?: AccountSnapshotWhereInput | AccountSnapshotWhereInput[]
    OR?: AccountSnapshotWhereInput[]
    NOT?: AccountSnapshotWhereInput | AccountSnapshotWhereInput[]
    id?: StringFilter<"AccountSnapshot"> | string
    balance?: FloatFilter<"AccountSnapshot"> | number
    equity?: FloatFilter<"AccountSnapshot"> | number
    margin?: FloatFilter<"AccountSnapshot"> | number
    freeMargin?: FloatFilter<"AccountSnapshot"> | number
    marginLevel?: FloatNullableFilter<"AccountSnapshot"> | number | null
    currency?: StringFilter<"AccountSnapshot"> | string
    leverage?: IntNullableFilter<"AccountSnapshot"> | number | null
    capturedAt?: DateTimeFilter<"AccountSnapshot"> | Date | string
  }

  export type AccountSnapshotOrderByWithRelationInput = {
    id?: SortOrder
    balance?: SortOrder
    equity?: SortOrder
    margin?: SortOrder
    freeMargin?: SortOrder
    marginLevel?: SortOrderInput | SortOrder
    currency?: SortOrder
    leverage?: SortOrderInput | SortOrder
    capturedAt?: SortOrder
  }

  export type AccountSnapshotWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AccountSnapshotWhereInput | AccountSnapshotWhereInput[]
    OR?: AccountSnapshotWhereInput[]
    NOT?: AccountSnapshotWhereInput | AccountSnapshotWhereInput[]
    balance?: FloatFilter<"AccountSnapshot"> | number
    equity?: FloatFilter<"AccountSnapshot"> | number
    margin?: FloatFilter<"AccountSnapshot"> | number
    freeMargin?: FloatFilter<"AccountSnapshot"> | number
    marginLevel?: FloatNullableFilter<"AccountSnapshot"> | number | null
    currency?: StringFilter<"AccountSnapshot"> | string
    leverage?: IntNullableFilter<"AccountSnapshot"> | number | null
    capturedAt?: DateTimeFilter<"AccountSnapshot"> | Date | string
  }, "id">

  export type AccountSnapshotOrderByWithAggregationInput = {
    id?: SortOrder
    balance?: SortOrder
    equity?: SortOrder
    margin?: SortOrder
    freeMargin?: SortOrder
    marginLevel?: SortOrderInput | SortOrder
    currency?: SortOrder
    leverage?: SortOrderInput | SortOrder
    capturedAt?: SortOrder
    _count?: AccountSnapshotCountOrderByAggregateInput
    _avg?: AccountSnapshotAvgOrderByAggregateInput
    _max?: AccountSnapshotMaxOrderByAggregateInput
    _min?: AccountSnapshotMinOrderByAggregateInput
    _sum?: AccountSnapshotSumOrderByAggregateInput
  }

  export type AccountSnapshotScalarWhereWithAggregatesInput = {
    AND?: AccountSnapshotScalarWhereWithAggregatesInput | AccountSnapshotScalarWhereWithAggregatesInput[]
    OR?: AccountSnapshotScalarWhereWithAggregatesInput[]
    NOT?: AccountSnapshotScalarWhereWithAggregatesInput | AccountSnapshotScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AccountSnapshot"> | string
    balance?: FloatWithAggregatesFilter<"AccountSnapshot"> | number
    equity?: FloatWithAggregatesFilter<"AccountSnapshot"> | number
    margin?: FloatWithAggregatesFilter<"AccountSnapshot"> | number
    freeMargin?: FloatWithAggregatesFilter<"AccountSnapshot"> | number
    marginLevel?: FloatNullableWithAggregatesFilter<"AccountSnapshot"> | number | null
    currency?: StringWithAggregatesFilter<"AccountSnapshot"> | string
    leverage?: IntNullableWithAggregatesFilter<"AccountSnapshot"> | number | null
    capturedAt?: DateTimeWithAggregatesFilter<"AccountSnapshot"> | Date | string
  }

  export type RiskSnapshotWhereInput = {
    AND?: RiskSnapshotWhereInput | RiskSnapshotWhereInput[]
    OR?: RiskSnapshotWhereInput[]
    NOT?: RiskSnapshotWhereInput | RiskSnapshotWhereInput[]
    id?: StringFilter<"RiskSnapshot"> | string
    dailyPnl?: FloatFilter<"RiskSnapshot"> | number
    dailyDrawdownPct?: FloatFilter<"RiskSnapshot"> | number
    maxDrawdownPct?: FloatFilter<"RiskSnapshot"> | number
    openRiskPct?: FloatFilter<"RiskSnapshot"> | number
    exposurePct?: FloatFilter<"RiskSnapshot"> | number
    riskPerTradePct?: FloatFilter<"RiskSnapshot"> | number
    openPositions?: IntFilter<"RiskSnapshot"> | number
    marginLevel?: FloatNullableFilter<"RiskSnapshot"> | number | null
    capturedAt?: DateTimeFilter<"RiskSnapshot"> | Date | string
  }

  export type RiskSnapshotOrderByWithRelationInput = {
    id?: SortOrder
    dailyPnl?: SortOrder
    dailyDrawdownPct?: SortOrder
    maxDrawdownPct?: SortOrder
    openRiskPct?: SortOrder
    exposurePct?: SortOrder
    riskPerTradePct?: SortOrder
    openPositions?: SortOrder
    marginLevel?: SortOrderInput | SortOrder
    capturedAt?: SortOrder
  }

  export type RiskSnapshotWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RiskSnapshotWhereInput | RiskSnapshotWhereInput[]
    OR?: RiskSnapshotWhereInput[]
    NOT?: RiskSnapshotWhereInput | RiskSnapshotWhereInput[]
    dailyPnl?: FloatFilter<"RiskSnapshot"> | number
    dailyDrawdownPct?: FloatFilter<"RiskSnapshot"> | number
    maxDrawdownPct?: FloatFilter<"RiskSnapshot"> | number
    openRiskPct?: FloatFilter<"RiskSnapshot"> | number
    exposurePct?: FloatFilter<"RiskSnapshot"> | number
    riskPerTradePct?: FloatFilter<"RiskSnapshot"> | number
    openPositions?: IntFilter<"RiskSnapshot"> | number
    marginLevel?: FloatNullableFilter<"RiskSnapshot"> | number | null
    capturedAt?: DateTimeFilter<"RiskSnapshot"> | Date | string
  }, "id">

  export type RiskSnapshotOrderByWithAggregationInput = {
    id?: SortOrder
    dailyPnl?: SortOrder
    dailyDrawdownPct?: SortOrder
    maxDrawdownPct?: SortOrder
    openRiskPct?: SortOrder
    exposurePct?: SortOrder
    riskPerTradePct?: SortOrder
    openPositions?: SortOrder
    marginLevel?: SortOrderInput | SortOrder
    capturedAt?: SortOrder
    _count?: RiskSnapshotCountOrderByAggregateInput
    _avg?: RiskSnapshotAvgOrderByAggregateInput
    _max?: RiskSnapshotMaxOrderByAggregateInput
    _min?: RiskSnapshotMinOrderByAggregateInput
    _sum?: RiskSnapshotSumOrderByAggregateInput
  }

  export type RiskSnapshotScalarWhereWithAggregatesInput = {
    AND?: RiskSnapshotScalarWhereWithAggregatesInput | RiskSnapshotScalarWhereWithAggregatesInput[]
    OR?: RiskSnapshotScalarWhereWithAggregatesInput[]
    NOT?: RiskSnapshotScalarWhereWithAggregatesInput | RiskSnapshotScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"RiskSnapshot"> | string
    dailyPnl?: FloatWithAggregatesFilter<"RiskSnapshot"> | number
    dailyDrawdownPct?: FloatWithAggregatesFilter<"RiskSnapshot"> | number
    maxDrawdownPct?: FloatWithAggregatesFilter<"RiskSnapshot"> | number
    openRiskPct?: FloatWithAggregatesFilter<"RiskSnapshot"> | number
    exposurePct?: FloatWithAggregatesFilter<"RiskSnapshot"> | number
    riskPerTradePct?: FloatWithAggregatesFilter<"RiskSnapshot"> | number
    openPositions?: IntWithAggregatesFilter<"RiskSnapshot"> | number
    marginLevel?: FloatNullableWithAggregatesFilter<"RiskSnapshot"> | number | null
    capturedAt?: DateTimeWithAggregatesFilter<"RiskSnapshot"> | Date | string
  }

  export type MarketCandleWhereInput = {
    AND?: MarketCandleWhereInput | MarketCandleWhereInput[]
    OR?: MarketCandleWhereInput[]
    NOT?: MarketCandleWhereInput | MarketCandleWhereInput[]
    id?: StringFilter<"MarketCandle"> | string
    symbol?: StringFilter<"MarketCandle"> | string
    timeframe?: StringFilter<"MarketCandle"> | string
    openTime?: DateTimeFilter<"MarketCandle"> | Date | string
    open?: FloatFilter<"MarketCandle"> | number
    high?: FloatFilter<"MarketCandle"> | number
    low?: FloatFilter<"MarketCandle"> | number
    close?: FloatFilter<"MarketCandle"> | number
    volume?: FloatFilter<"MarketCandle"> | number
    spread?: FloatNullableFilter<"MarketCandle"> | number | null
  }

  export type MarketCandleOrderByWithRelationInput = {
    id?: SortOrder
    symbol?: SortOrder
    timeframe?: SortOrder
    openTime?: SortOrder
    open?: SortOrder
    high?: SortOrder
    low?: SortOrder
    close?: SortOrder
    volume?: SortOrder
    spread?: SortOrderInput | SortOrder
  }

  export type MarketCandleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    symbol_timeframe_openTime?: MarketCandleSymbolTimeframeOpenTimeCompoundUniqueInput
    AND?: MarketCandleWhereInput | MarketCandleWhereInput[]
    OR?: MarketCandleWhereInput[]
    NOT?: MarketCandleWhereInput | MarketCandleWhereInput[]
    symbol?: StringFilter<"MarketCandle"> | string
    timeframe?: StringFilter<"MarketCandle"> | string
    openTime?: DateTimeFilter<"MarketCandle"> | Date | string
    open?: FloatFilter<"MarketCandle"> | number
    high?: FloatFilter<"MarketCandle"> | number
    low?: FloatFilter<"MarketCandle"> | number
    close?: FloatFilter<"MarketCandle"> | number
    volume?: FloatFilter<"MarketCandle"> | number
    spread?: FloatNullableFilter<"MarketCandle"> | number | null
  }, "id" | "symbol_timeframe_openTime">

  export type MarketCandleOrderByWithAggregationInput = {
    id?: SortOrder
    symbol?: SortOrder
    timeframe?: SortOrder
    openTime?: SortOrder
    open?: SortOrder
    high?: SortOrder
    low?: SortOrder
    close?: SortOrder
    volume?: SortOrder
    spread?: SortOrderInput | SortOrder
    _count?: MarketCandleCountOrderByAggregateInput
    _avg?: MarketCandleAvgOrderByAggregateInput
    _max?: MarketCandleMaxOrderByAggregateInput
    _min?: MarketCandleMinOrderByAggregateInput
    _sum?: MarketCandleSumOrderByAggregateInput
  }

  export type MarketCandleScalarWhereWithAggregatesInput = {
    AND?: MarketCandleScalarWhereWithAggregatesInput | MarketCandleScalarWhereWithAggregatesInput[]
    OR?: MarketCandleScalarWhereWithAggregatesInput[]
    NOT?: MarketCandleScalarWhereWithAggregatesInput | MarketCandleScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MarketCandle"> | string
    symbol?: StringWithAggregatesFilter<"MarketCandle"> | string
    timeframe?: StringWithAggregatesFilter<"MarketCandle"> | string
    openTime?: DateTimeWithAggregatesFilter<"MarketCandle"> | Date | string
    open?: FloatWithAggregatesFilter<"MarketCandle"> | number
    high?: FloatWithAggregatesFilter<"MarketCandle"> | number
    low?: FloatWithAggregatesFilter<"MarketCandle"> | number
    close?: FloatWithAggregatesFilter<"MarketCandle"> | number
    volume?: FloatWithAggregatesFilter<"MarketCandle"> | number
    spread?: FloatNullableWithAggregatesFilter<"MarketCandle"> | number | null
  }

  export type LogEntryWhereInput = {
    AND?: LogEntryWhereInput | LogEntryWhereInput[]
    OR?: LogEntryWhereInput[]
    NOT?: LogEntryWhereInput | LogEntryWhereInput[]
    id?: StringFilter<"LogEntry"> | string
    level?: EnumLogLevelFilter<"LogEntry"> | $Enums.LogLevel
    logger?: StringNullableFilter<"LogEntry"> | string | null
    message?: StringFilter<"LogEntry"> | string
    context?: JsonNullableFilter<"LogEntry">
    createdAt?: DateTimeFilter<"LogEntry"> | Date | string
  }

  export type LogEntryOrderByWithRelationInput = {
    id?: SortOrder
    level?: SortOrder
    logger?: SortOrderInput | SortOrder
    message?: SortOrder
    context?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type LogEntryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: LogEntryWhereInput | LogEntryWhereInput[]
    OR?: LogEntryWhereInput[]
    NOT?: LogEntryWhereInput | LogEntryWhereInput[]
    level?: EnumLogLevelFilter<"LogEntry"> | $Enums.LogLevel
    logger?: StringNullableFilter<"LogEntry"> | string | null
    message?: StringFilter<"LogEntry"> | string
    context?: JsonNullableFilter<"LogEntry">
    createdAt?: DateTimeFilter<"LogEntry"> | Date | string
  }, "id">

  export type LogEntryOrderByWithAggregationInput = {
    id?: SortOrder
    level?: SortOrder
    logger?: SortOrderInput | SortOrder
    message?: SortOrder
    context?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: LogEntryCountOrderByAggregateInput
    _max?: LogEntryMaxOrderByAggregateInput
    _min?: LogEntryMinOrderByAggregateInput
  }

  export type LogEntryScalarWhereWithAggregatesInput = {
    AND?: LogEntryScalarWhereWithAggregatesInput | LogEntryScalarWhereWithAggregatesInput[]
    OR?: LogEntryScalarWhereWithAggregatesInput[]
    NOT?: LogEntryScalarWhereWithAggregatesInput | LogEntryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"LogEntry"> | string
    level?: EnumLogLevelWithAggregatesFilter<"LogEntry"> | $Enums.LogLevel
    logger?: StringNullableWithAggregatesFilter<"LogEntry"> | string | null
    message?: StringWithAggregatesFilter<"LogEntry"> | string
    context?: JsonNullableWithAggregatesFilter<"LogEntry">
    createdAt?: DateTimeWithAggregatesFilter<"LogEntry"> | Date | string
  }

  export type JournalEntryWhereInput = {
    AND?: JournalEntryWhereInput | JournalEntryWhereInput[]
    OR?: JournalEntryWhereInput[]
    NOT?: JournalEntryWhereInput | JournalEntryWhereInput[]
    id?: StringFilter<"JournalEntry"> | string
    entryType?: StringFilter<"JournalEntry"> | string
    symbol?: StringNullableFilter<"JournalEntry"> | string | null
    title?: StringFilter<"JournalEntry"> | string
    content?: JsonNullableFilter<"JournalEntry">
    createdAt?: DateTimeFilter<"JournalEntry"> | Date | string
  }

  export type JournalEntryOrderByWithRelationInput = {
    id?: SortOrder
    entryType?: SortOrder
    symbol?: SortOrderInput | SortOrder
    title?: SortOrder
    content?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type JournalEntryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: JournalEntryWhereInput | JournalEntryWhereInput[]
    OR?: JournalEntryWhereInput[]
    NOT?: JournalEntryWhereInput | JournalEntryWhereInput[]
    entryType?: StringFilter<"JournalEntry"> | string
    symbol?: StringNullableFilter<"JournalEntry"> | string | null
    title?: StringFilter<"JournalEntry"> | string
    content?: JsonNullableFilter<"JournalEntry">
    createdAt?: DateTimeFilter<"JournalEntry"> | Date | string
  }, "id">

  export type JournalEntryOrderByWithAggregationInput = {
    id?: SortOrder
    entryType?: SortOrder
    symbol?: SortOrderInput | SortOrder
    title?: SortOrder
    content?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: JournalEntryCountOrderByAggregateInput
    _max?: JournalEntryMaxOrderByAggregateInput
    _min?: JournalEntryMinOrderByAggregateInput
  }

  export type JournalEntryScalarWhereWithAggregatesInput = {
    AND?: JournalEntryScalarWhereWithAggregatesInput | JournalEntryScalarWhereWithAggregatesInput[]
    OR?: JournalEntryScalarWhereWithAggregatesInput[]
    NOT?: JournalEntryScalarWhereWithAggregatesInput | JournalEntryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"JournalEntry"> | string
    entryType?: StringWithAggregatesFilter<"JournalEntry"> | string
    symbol?: StringNullableWithAggregatesFilter<"JournalEntry"> | string | null
    title?: StringWithAggregatesFilter<"JournalEntry"> | string
    content?: JsonNullableWithAggregatesFilter<"JournalEntry">
    createdAt?: DateTimeWithAggregatesFilter<"JournalEntry"> | Date | string
  }

  export type NotificationWhereInput = {
    AND?: NotificationWhereInput | NotificationWhereInput[]
    OR?: NotificationWhereInput[]
    NOT?: NotificationWhereInput | NotificationWhereInput[]
    id?: StringFilter<"Notification"> | string
    channel?: StringFilter<"Notification"> | string
    level?: EnumLogLevelFilter<"Notification"> | $Enums.LogLevel
    title?: StringFilter<"Notification"> | string
    body?: StringFilter<"Notification"> | string
    status?: EnumNotificationStatusFilter<"Notification"> | $Enums.NotificationStatus
    sentAt?: DateTimeNullableFilter<"Notification"> | Date | string | null
    createdAt?: DateTimeFilter<"Notification"> | Date | string
  }

  export type NotificationOrderByWithRelationInput = {
    id?: SortOrder
    channel?: SortOrder
    level?: SortOrder
    title?: SortOrder
    body?: SortOrder
    status?: SortOrder
    sentAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type NotificationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: NotificationWhereInput | NotificationWhereInput[]
    OR?: NotificationWhereInput[]
    NOT?: NotificationWhereInput | NotificationWhereInput[]
    channel?: StringFilter<"Notification"> | string
    level?: EnumLogLevelFilter<"Notification"> | $Enums.LogLevel
    title?: StringFilter<"Notification"> | string
    body?: StringFilter<"Notification"> | string
    status?: EnumNotificationStatusFilter<"Notification"> | $Enums.NotificationStatus
    sentAt?: DateTimeNullableFilter<"Notification"> | Date | string | null
    createdAt?: DateTimeFilter<"Notification"> | Date | string
  }, "id">

  export type NotificationOrderByWithAggregationInput = {
    id?: SortOrder
    channel?: SortOrder
    level?: SortOrder
    title?: SortOrder
    body?: SortOrder
    status?: SortOrder
    sentAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: NotificationCountOrderByAggregateInput
    _max?: NotificationMaxOrderByAggregateInput
    _min?: NotificationMinOrderByAggregateInput
  }

  export type NotificationScalarWhereWithAggregatesInput = {
    AND?: NotificationScalarWhereWithAggregatesInput | NotificationScalarWhereWithAggregatesInput[]
    OR?: NotificationScalarWhereWithAggregatesInput[]
    NOT?: NotificationScalarWhereWithAggregatesInput | NotificationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Notification"> | string
    channel?: StringWithAggregatesFilter<"Notification"> | string
    level?: EnumLogLevelWithAggregatesFilter<"Notification"> | $Enums.LogLevel
    title?: StringWithAggregatesFilter<"Notification"> | string
    body?: StringWithAggregatesFilter<"Notification"> | string
    status?: EnumNotificationStatusWithAggregatesFilter<"Notification"> | $Enums.NotificationStatus
    sentAt?: DateTimeNullableWithAggregatesFilter<"Notification"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Notification"> | Date | string
  }

  export type BotStateWhereInput = {
    AND?: BotStateWhereInput | BotStateWhereInput[]
    OR?: BotStateWhereInput[]
    NOT?: BotStateWhereInput | BotStateWhereInput[]
    id?: StringFilter<"BotState"> | string
    mode?: EnumBotModeFilter<"BotState"> | $Enums.BotMode
    killSwitch?: BoolFilter<"BotState"> | boolean
    activeStrategy?: StringNullableFilter<"BotState"> | string | null
    maxOpenTrades?: IntFilter<"BotState"> | number
    maxDailyLossPct?: FloatFilter<"BotState"> | number
    note?: StringNullableFilter<"BotState"> | string | null
    updatedBy?: StringNullableFilter<"BotState"> | string | null
    updatedAt?: DateTimeFilter<"BotState"> | Date | string
    createdAt?: DateTimeFilter<"BotState"> | Date | string
  }

  export type BotStateOrderByWithRelationInput = {
    id?: SortOrder
    mode?: SortOrder
    killSwitch?: SortOrder
    activeStrategy?: SortOrderInput | SortOrder
    maxOpenTrades?: SortOrder
    maxDailyLossPct?: SortOrder
    note?: SortOrderInput | SortOrder
    updatedBy?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type BotStateWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: BotStateWhereInput | BotStateWhereInput[]
    OR?: BotStateWhereInput[]
    NOT?: BotStateWhereInput | BotStateWhereInput[]
    mode?: EnumBotModeFilter<"BotState"> | $Enums.BotMode
    killSwitch?: BoolFilter<"BotState"> | boolean
    activeStrategy?: StringNullableFilter<"BotState"> | string | null
    maxOpenTrades?: IntFilter<"BotState"> | number
    maxDailyLossPct?: FloatFilter<"BotState"> | number
    note?: StringNullableFilter<"BotState"> | string | null
    updatedBy?: StringNullableFilter<"BotState"> | string | null
    updatedAt?: DateTimeFilter<"BotState"> | Date | string
    createdAt?: DateTimeFilter<"BotState"> | Date | string
  }, "id">

  export type BotStateOrderByWithAggregationInput = {
    id?: SortOrder
    mode?: SortOrder
    killSwitch?: SortOrder
    activeStrategy?: SortOrderInput | SortOrder
    maxOpenTrades?: SortOrder
    maxDailyLossPct?: SortOrder
    note?: SortOrderInput | SortOrder
    updatedBy?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    createdAt?: SortOrder
    _count?: BotStateCountOrderByAggregateInput
    _avg?: BotStateAvgOrderByAggregateInput
    _max?: BotStateMaxOrderByAggregateInput
    _min?: BotStateMinOrderByAggregateInput
    _sum?: BotStateSumOrderByAggregateInput
  }

  export type BotStateScalarWhereWithAggregatesInput = {
    AND?: BotStateScalarWhereWithAggregatesInput | BotStateScalarWhereWithAggregatesInput[]
    OR?: BotStateScalarWhereWithAggregatesInput[]
    NOT?: BotStateScalarWhereWithAggregatesInput | BotStateScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"BotState"> | string
    mode?: EnumBotModeWithAggregatesFilter<"BotState"> | $Enums.BotMode
    killSwitch?: BoolWithAggregatesFilter<"BotState"> | boolean
    activeStrategy?: StringNullableWithAggregatesFilter<"BotState"> | string | null
    maxOpenTrades?: IntWithAggregatesFilter<"BotState"> | number
    maxDailyLossPct?: FloatWithAggregatesFilter<"BotState"> | number
    note?: StringNullableWithAggregatesFilter<"BotState"> | string | null
    updatedBy?: StringNullableWithAggregatesFilter<"BotState"> | string | null
    updatedAt?: DateTimeWithAggregatesFilter<"BotState"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"BotState"> | Date | string
  }

  export type SessionWindowWhereInput = {
    AND?: SessionWindowWhereInput | SessionWindowWhereInput[]
    OR?: SessionWindowWhereInput[]
    NOT?: SessionWindowWhereInput | SessionWindowWhereInput[]
    id?: StringFilter<"SessionWindow"> | string
    sessionName?: StringFilter<"SessionWindow"> | string
    startMinuteUtc?: IntFilter<"SessionWindow"> | number
    endMinuteUtc?: IntFilter<"SessionWindow"> | number
    enabled?: BoolFilter<"SessionWindow"> | boolean
    tradingEnabled?: BoolFilter<"SessionWindow"> | boolean
    symbols?: StringNullableListFilter<"SessionWindow">
    note?: StringNullableFilter<"SessionWindow"> | string | null
    createdAt?: DateTimeFilter<"SessionWindow"> | Date | string
    updatedAt?: DateTimeFilter<"SessionWindow"> | Date | string
    decisions?: DecisionLogListRelationFilter
  }

  export type SessionWindowOrderByWithRelationInput = {
    id?: SortOrder
    sessionName?: SortOrder
    startMinuteUtc?: SortOrder
    endMinuteUtc?: SortOrder
    enabled?: SortOrder
    tradingEnabled?: SortOrder
    symbols?: SortOrder
    note?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    decisions?: DecisionLogOrderByRelationAggregateInput
  }

  export type SessionWindowWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    sessionName?: string
    AND?: SessionWindowWhereInput | SessionWindowWhereInput[]
    OR?: SessionWindowWhereInput[]
    NOT?: SessionWindowWhereInput | SessionWindowWhereInput[]
    startMinuteUtc?: IntFilter<"SessionWindow"> | number
    endMinuteUtc?: IntFilter<"SessionWindow"> | number
    enabled?: BoolFilter<"SessionWindow"> | boolean
    tradingEnabled?: BoolFilter<"SessionWindow"> | boolean
    symbols?: StringNullableListFilter<"SessionWindow">
    note?: StringNullableFilter<"SessionWindow"> | string | null
    createdAt?: DateTimeFilter<"SessionWindow"> | Date | string
    updatedAt?: DateTimeFilter<"SessionWindow"> | Date | string
    decisions?: DecisionLogListRelationFilter
  }, "id" | "sessionName">

  export type SessionWindowOrderByWithAggregationInput = {
    id?: SortOrder
    sessionName?: SortOrder
    startMinuteUtc?: SortOrder
    endMinuteUtc?: SortOrder
    enabled?: SortOrder
    tradingEnabled?: SortOrder
    symbols?: SortOrder
    note?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SessionWindowCountOrderByAggregateInput
    _avg?: SessionWindowAvgOrderByAggregateInput
    _max?: SessionWindowMaxOrderByAggregateInput
    _min?: SessionWindowMinOrderByAggregateInput
    _sum?: SessionWindowSumOrderByAggregateInput
  }

  export type SessionWindowScalarWhereWithAggregatesInput = {
    AND?: SessionWindowScalarWhereWithAggregatesInput | SessionWindowScalarWhereWithAggregatesInput[]
    OR?: SessionWindowScalarWhereWithAggregatesInput[]
    NOT?: SessionWindowScalarWhereWithAggregatesInput | SessionWindowScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SessionWindow"> | string
    sessionName?: StringWithAggregatesFilter<"SessionWindow"> | string
    startMinuteUtc?: IntWithAggregatesFilter<"SessionWindow"> | number
    endMinuteUtc?: IntWithAggregatesFilter<"SessionWindow"> | number
    enabled?: BoolWithAggregatesFilter<"SessionWindow"> | boolean
    tradingEnabled?: BoolWithAggregatesFilter<"SessionWindow"> | boolean
    symbols?: StringNullableListFilter<"SessionWindow">
    note?: StringNullableWithAggregatesFilter<"SessionWindow"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"SessionWindow"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"SessionWindow"> | Date | string
  }

  export type DecisionLogWhereInput = {
    AND?: DecisionLogWhereInput | DecisionLogWhereInput[]
    OR?: DecisionLogWhereInput[]
    NOT?: DecisionLogWhereInput | DecisionLogWhereInput[]
    id?: StringFilter<"DecisionLog"> | string
    symbol?: StringFilter<"DecisionLog"> | string
    timeframe?: StringNullableFilter<"DecisionLog"> | string | null
    action?: EnumDecisionActionFilter<"DecisionLog"> | $Enums.DecisionAction
    status?: EnumDecisionStatusFilter<"DecisionLog"> | $Enums.DecisionStatus
    model?: StringNullableFilter<"DecisionLog"> | string | null
    inputPrompt?: StringFilter<"DecisionLog"> | string
    outputDecision?: StringFilter<"DecisionLog"> | string
    rationale?: StringNullableFilter<"DecisionLog"> | string | null
    confidenceScore?: FloatNullableFilter<"DecisionLog"> | number | null
    proposedSl?: FloatNullableFilter<"DecisionLog"> | number | null
    proposedTp?: FloatNullableFilter<"DecisionLog"> | number | null
    proposedVolume?: FloatNullableFilter<"DecisionLog"> | number | null
    latencyMs?: IntNullableFilter<"DecisionLog"> | number | null
    error?: StringNullableFilter<"DecisionLog"> | string | null
    signalId?: StringNullableFilter<"DecisionLog"> | string | null
    sessionWindowId?: StringNullableFilter<"DecisionLog"> | string | null
    pendingOrderId?: StringNullableFilter<"DecisionLog"> | string | null
    tradeId?: StringNullableFilter<"DecisionLog"> | string | null
    createdAt?: DateTimeFilter<"DecisionLog"> | Date | string
    signal?: XOR<SignalNullableScalarRelationFilter, SignalWhereInput> | null
    sessionWindow?: XOR<SessionWindowNullableScalarRelationFilter, SessionWindowWhereInput> | null
    pendingOrder?: XOR<PendingOrderNullableScalarRelationFilter, PendingOrderWhereInput> | null
    trade?: XOR<TradeNullableScalarRelationFilter, TradeWhereInput> | null
  }

  export type DecisionLogOrderByWithRelationInput = {
    id?: SortOrder
    symbol?: SortOrder
    timeframe?: SortOrderInput | SortOrder
    action?: SortOrder
    status?: SortOrder
    model?: SortOrderInput | SortOrder
    inputPrompt?: SortOrder
    outputDecision?: SortOrder
    rationale?: SortOrderInput | SortOrder
    confidenceScore?: SortOrderInput | SortOrder
    proposedSl?: SortOrderInput | SortOrder
    proposedTp?: SortOrderInput | SortOrder
    proposedVolume?: SortOrderInput | SortOrder
    latencyMs?: SortOrderInput | SortOrder
    error?: SortOrderInput | SortOrder
    signalId?: SortOrderInput | SortOrder
    sessionWindowId?: SortOrderInput | SortOrder
    pendingOrderId?: SortOrderInput | SortOrder
    tradeId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    signal?: SignalOrderByWithRelationInput
    sessionWindow?: SessionWindowOrderByWithRelationInput
    pendingOrder?: PendingOrderOrderByWithRelationInput
    trade?: TradeOrderByWithRelationInput
  }

  export type DecisionLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    pendingOrderId?: string
    AND?: DecisionLogWhereInput | DecisionLogWhereInput[]
    OR?: DecisionLogWhereInput[]
    NOT?: DecisionLogWhereInput | DecisionLogWhereInput[]
    symbol?: StringFilter<"DecisionLog"> | string
    timeframe?: StringNullableFilter<"DecisionLog"> | string | null
    action?: EnumDecisionActionFilter<"DecisionLog"> | $Enums.DecisionAction
    status?: EnumDecisionStatusFilter<"DecisionLog"> | $Enums.DecisionStatus
    model?: StringNullableFilter<"DecisionLog"> | string | null
    inputPrompt?: StringFilter<"DecisionLog"> | string
    outputDecision?: StringFilter<"DecisionLog"> | string
    rationale?: StringNullableFilter<"DecisionLog"> | string | null
    confidenceScore?: FloatNullableFilter<"DecisionLog"> | number | null
    proposedSl?: FloatNullableFilter<"DecisionLog"> | number | null
    proposedTp?: FloatNullableFilter<"DecisionLog"> | number | null
    proposedVolume?: FloatNullableFilter<"DecisionLog"> | number | null
    latencyMs?: IntNullableFilter<"DecisionLog"> | number | null
    error?: StringNullableFilter<"DecisionLog"> | string | null
    signalId?: StringNullableFilter<"DecisionLog"> | string | null
    sessionWindowId?: StringNullableFilter<"DecisionLog"> | string | null
    tradeId?: StringNullableFilter<"DecisionLog"> | string | null
    createdAt?: DateTimeFilter<"DecisionLog"> | Date | string
    signal?: XOR<SignalNullableScalarRelationFilter, SignalWhereInput> | null
    sessionWindow?: XOR<SessionWindowNullableScalarRelationFilter, SessionWindowWhereInput> | null
    pendingOrder?: XOR<PendingOrderNullableScalarRelationFilter, PendingOrderWhereInput> | null
    trade?: XOR<TradeNullableScalarRelationFilter, TradeWhereInput> | null
  }, "id" | "pendingOrderId">

  export type DecisionLogOrderByWithAggregationInput = {
    id?: SortOrder
    symbol?: SortOrder
    timeframe?: SortOrderInput | SortOrder
    action?: SortOrder
    status?: SortOrder
    model?: SortOrderInput | SortOrder
    inputPrompt?: SortOrder
    outputDecision?: SortOrder
    rationale?: SortOrderInput | SortOrder
    confidenceScore?: SortOrderInput | SortOrder
    proposedSl?: SortOrderInput | SortOrder
    proposedTp?: SortOrderInput | SortOrder
    proposedVolume?: SortOrderInput | SortOrder
    latencyMs?: SortOrderInput | SortOrder
    error?: SortOrderInput | SortOrder
    signalId?: SortOrderInput | SortOrder
    sessionWindowId?: SortOrderInput | SortOrder
    pendingOrderId?: SortOrderInput | SortOrder
    tradeId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: DecisionLogCountOrderByAggregateInput
    _avg?: DecisionLogAvgOrderByAggregateInput
    _max?: DecisionLogMaxOrderByAggregateInput
    _min?: DecisionLogMinOrderByAggregateInput
    _sum?: DecisionLogSumOrderByAggregateInput
  }

  export type DecisionLogScalarWhereWithAggregatesInput = {
    AND?: DecisionLogScalarWhereWithAggregatesInput | DecisionLogScalarWhereWithAggregatesInput[]
    OR?: DecisionLogScalarWhereWithAggregatesInput[]
    NOT?: DecisionLogScalarWhereWithAggregatesInput | DecisionLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DecisionLog"> | string
    symbol?: StringWithAggregatesFilter<"DecisionLog"> | string
    timeframe?: StringNullableWithAggregatesFilter<"DecisionLog"> | string | null
    action?: EnumDecisionActionWithAggregatesFilter<"DecisionLog"> | $Enums.DecisionAction
    status?: EnumDecisionStatusWithAggregatesFilter<"DecisionLog"> | $Enums.DecisionStatus
    model?: StringNullableWithAggregatesFilter<"DecisionLog"> | string | null
    inputPrompt?: StringWithAggregatesFilter<"DecisionLog"> | string
    outputDecision?: StringWithAggregatesFilter<"DecisionLog"> | string
    rationale?: StringNullableWithAggregatesFilter<"DecisionLog"> | string | null
    confidenceScore?: FloatNullableWithAggregatesFilter<"DecisionLog"> | number | null
    proposedSl?: FloatNullableWithAggregatesFilter<"DecisionLog"> | number | null
    proposedTp?: FloatNullableWithAggregatesFilter<"DecisionLog"> | number | null
    proposedVolume?: FloatNullableWithAggregatesFilter<"DecisionLog"> | number | null
    latencyMs?: IntNullableWithAggregatesFilter<"DecisionLog"> | number | null
    error?: StringNullableWithAggregatesFilter<"DecisionLog"> | string | null
    signalId?: StringNullableWithAggregatesFilter<"DecisionLog"> | string | null
    sessionWindowId?: StringNullableWithAggregatesFilter<"DecisionLog"> | string | null
    pendingOrderId?: StringNullableWithAggregatesFilter<"DecisionLog"> | string | null
    tradeId?: StringNullableWithAggregatesFilter<"DecisionLog"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"DecisionLog"> | Date | string
  }

  export type PendingOrderWhereInput = {
    AND?: PendingOrderWhereInput | PendingOrderWhereInput[]
    OR?: PendingOrderWhereInput[]
    NOT?: PendingOrderWhereInput | PendingOrderWhereInput[]
    id?: StringFilter<"PendingOrder"> | string
    ticket?: BigIntFilter<"PendingOrder"> | bigint | number
    symbol?: StringFilter<"PendingOrder"> | string
    type?: EnumPendingOrderTypeFilter<"PendingOrder"> | $Enums.PendingOrderType
    status?: EnumPendingOrderStatusFilter<"PendingOrder"> | $Enums.PendingOrderStatus
    volume?: FloatFilter<"PendingOrder"> | number
    price?: FloatFilter<"PendingOrder"> | number
    stopLoss?: FloatNullableFilter<"PendingOrder"> | number | null
    takeProfit?: FloatNullableFilter<"PendingOrder"> | number | null
    magic?: IntNullableFilter<"PendingOrder"> | number | null
    strategy?: StringNullableFilter<"PendingOrder"> | string | null
    comment?: StringNullableFilter<"PendingOrder"> | string | null
    placedAt?: DateTimeFilter<"PendingOrder"> | Date | string
    expiresAt?: DateTimeNullableFilter<"PendingOrder"> | Date | string | null
    triggeredAt?: DateTimeNullableFilter<"PendingOrder"> | Date | string | null
    updatedAt?: DateTimeFilter<"PendingOrder"> | Date | string
    decision?: XOR<DecisionLogNullableScalarRelationFilter, DecisionLogWhereInput> | null
  }

  export type PendingOrderOrderByWithRelationInput = {
    id?: SortOrder
    ticket?: SortOrder
    symbol?: SortOrder
    type?: SortOrder
    status?: SortOrder
    volume?: SortOrder
    price?: SortOrder
    stopLoss?: SortOrderInput | SortOrder
    takeProfit?: SortOrderInput | SortOrder
    magic?: SortOrderInput | SortOrder
    strategy?: SortOrderInput | SortOrder
    comment?: SortOrderInput | SortOrder
    placedAt?: SortOrder
    expiresAt?: SortOrderInput | SortOrder
    triggeredAt?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    decision?: DecisionLogOrderByWithRelationInput
  }

  export type PendingOrderWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    ticket?: bigint | number
    AND?: PendingOrderWhereInput | PendingOrderWhereInput[]
    OR?: PendingOrderWhereInput[]
    NOT?: PendingOrderWhereInput | PendingOrderWhereInput[]
    symbol?: StringFilter<"PendingOrder"> | string
    type?: EnumPendingOrderTypeFilter<"PendingOrder"> | $Enums.PendingOrderType
    status?: EnumPendingOrderStatusFilter<"PendingOrder"> | $Enums.PendingOrderStatus
    volume?: FloatFilter<"PendingOrder"> | number
    price?: FloatFilter<"PendingOrder"> | number
    stopLoss?: FloatNullableFilter<"PendingOrder"> | number | null
    takeProfit?: FloatNullableFilter<"PendingOrder"> | number | null
    magic?: IntNullableFilter<"PendingOrder"> | number | null
    strategy?: StringNullableFilter<"PendingOrder"> | string | null
    comment?: StringNullableFilter<"PendingOrder"> | string | null
    placedAt?: DateTimeFilter<"PendingOrder"> | Date | string
    expiresAt?: DateTimeNullableFilter<"PendingOrder"> | Date | string | null
    triggeredAt?: DateTimeNullableFilter<"PendingOrder"> | Date | string | null
    updatedAt?: DateTimeFilter<"PendingOrder"> | Date | string
    decision?: XOR<DecisionLogNullableScalarRelationFilter, DecisionLogWhereInput> | null
  }, "id" | "ticket">

  export type PendingOrderOrderByWithAggregationInput = {
    id?: SortOrder
    ticket?: SortOrder
    symbol?: SortOrder
    type?: SortOrder
    status?: SortOrder
    volume?: SortOrder
    price?: SortOrder
    stopLoss?: SortOrderInput | SortOrder
    takeProfit?: SortOrderInput | SortOrder
    magic?: SortOrderInput | SortOrder
    strategy?: SortOrderInput | SortOrder
    comment?: SortOrderInput | SortOrder
    placedAt?: SortOrder
    expiresAt?: SortOrderInput | SortOrder
    triggeredAt?: SortOrderInput | SortOrder
    updatedAt?: SortOrder
    _count?: PendingOrderCountOrderByAggregateInput
    _avg?: PendingOrderAvgOrderByAggregateInput
    _max?: PendingOrderMaxOrderByAggregateInput
    _min?: PendingOrderMinOrderByAggregateInput
    _sum?: PendingOrderSumOrderByAggregateInput
  }

  export type PendingOrderScalarWhereWithAggregatesInput = {
    AND?: PendingOrderScalarWhereWithAggregatesInput | PendingOrderScalarWhereWithAggregatesInput[]
    OR?: PendingOrderScalarWhereWithAggregatesInput[]
    NOT?: PendingOrderScalarWhereWithAggregatesInput | PendingOrderScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PendingOrder"> | string
    ticket?: BigIntWithAggregatesFilter<"PendingOrder"> | bigint | number
    symbol?: StringWithAggregatesFilter<"PendingOrder"> | string
    type?: EnumPendingOrderTypeWithAggregatesFilter<"PendingOrder"> | $Enums.PendingOrderType
    status?: EnumPendingOrderStatusWithAggregatesFilter<"PendingOrder"> | $Enums.PendingOrderStatus
    volume?: FloatWithAggregatesFilter<"PendingOrder"> | number
    price?: FloatWithAggregatesFilter<"PendingOrder"> | number
    stopLoss?: FloatNullableWithAggregatesFilter<"PendingOrder"> | number | null
    takeProfit?: FloatNullableWithAggregatesFilter<"PendingOrder"> | number | null
    magic?: IntNullableWithAggregatesFilter<"PendingOrder"> | number | null
    strategy?: StringNullableWithAggregatesFilter<"PendingOrder"> | string | null
    comment?: StringNullableWithAggregatesFilter<"PendingOrder"> | string | null
    placedAt?: DateTimeWithAggregatesFilter<"PendingOrder"> | Date | string
    expiresAt?: DateTimeNullableWithAggregatesFilter<"PendingOrder"> | Date | string | null
    triggeredAt?: DateTimeNullableWithAggregatesFilter<"PendingOrder"> | Date | string | null
    updatedAt?: DateTimeWithAggregatesFilter<"PendingOrder"> | Date | string
  }

  export type BotHeartbeatWhereInput = {
    AND?: BotHeartbeatWhereInput | BotHeartbeatWhereInput[]
    OR?: BotHeartbeatWhereInput[]
    NOT?: BotHeartbeatWhereInput | BotHeartbeatWhereInput[]
    id?: StringFilter<"BotHeartbeat"> | string
    lastBeatAt?: DateTimeFilter<"BotHeartbeat"> | Date | string
    loopCount?: BigIntFilter<"BotHeartbeat"> | bigint | number
    mode?: StringNullableFilter<"BotHeartbeat"> | string | null
    killSwitch?: BoolFilter<"BotHeartbeat"> | boolean
    note?: StringNullableFilter<"BotHeartbeat"> | string | null
  }

  export type BotHeartbeatOrderByWithRelationInput = {
    id?: SortOrder
    lastBeatAt?: SortOrder
    loopCount?: SortOrder
    mode?: SortOrderInput | SortOrder
    killSwitch?: SortOrder
    note?: SortOrderInput | SortOrder
  }

  export type BotHeartbeatWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: BotHeartbeatWhereInput | BotHeartbeatWhereInput[]
    OR?: BotHeartbeatWhereInput[]
    NOT?: BotHeartbeatWhereInput | BotHeartbeatWhereInput[]
    lastBeatAt?: DateTimeFilter<"BotHeartbeat"> | Date | string
    loopCount?: BigIntFilter<"BotHeartbeat"> | bigint | number
    mode?: StringNullableFilter<"BotHeartbeat"> | string | null
    killSwitch?: BoolFilter<"BotHeartbeat"> | boolean
    note?: StringNullableFilter<"BotHeartbeat"> | string | null
  }, "id">

  export type BotHeartbeatOrderByWithAggregationInput = {
    id?: SortOrder
    lastBeatAt?: SortOrder
    loopCount?: SortOrder
    mode?: SortOrderInput | SortOrder
    killSwitch?: SortOrder
    note?: SortOrderInput | SortOrder
    _count?: BotHeartbeatCountOrderByAggregateInput
    _avg?: BotHeartbeatAvgOrderByAggregateInput
    _max?: BotHeartbeatMaxOrderByAggregateInput
    _min?: BotHeartbeatMinOrderByAggregateInput
    _sum?: BotHeartbeatSumOrderByAggregateInput
  }

  export type BotHeartbeatScalarWhereWithAggregatesInput = {
    AND?: BotHeartbeatScalarWhereWithAggregatesInput | BotHeartbeatScalarWhereWithAggregatesInput[]
    OR?: BotHeartbeatScalarWhereWithAggregatesInput[]
    NOT?: BotHeartbeatScalarWhereWithAggregatesInput | BotHeartbeatScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"BotHeartbeat"> | string
    lastBeatAt?: DateTimeWithAggregatesFilter<"BotHeartbeat"> | Date | string
    loopCount?: BigIntWithAggregatesFilter<"BotHeartbeat"> | bigint | number
    mode?: StringNullableWithAggregatesFilter<"BotHeartbeat"> | string | null
    killSwitch?: BoolWithAggregatesFilter<"BotHeartbeat"> | boolean
    note?: StringNullableWithAggregatesFilter<"BotHeartbeat"> | string | null
  }

  export type DailyRiskCounterWhereInput = {
    AND?: DailyRiskCounterWhereInput | DailyRiskCounterWhereInput[]
    OR?: DailyRiskCounterWhereInput[]
    NOT?: DailyRiskCounterWhereInput | DailyRiskCounterWhereInput[]
    id?: StringFilter<"DailyRiskCounter"> | string
    date?: DateTimeFilter<"DailyRiskCounter"> | Date | string
    realizedPnl?: FloatFilter<"DailyRiskCounter"> | number
    tradesOpened?: IntFilter<"DailyRiskCounter"> | number
  }

  export type DailyRiskCounterOrderByWithRelationInput = {
    id?: SortOrder
    date?: SortOrder
    realizedPnl?: SortOrder
    tradesOpened?: SortOrder
  }

  export type DailyRiskCounterWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    date?: Date | string
    AND?: DailyRiskCounterWhereInput | DailyRiskCounterWhereInput[]
    OR?: DailyRiskCounterWhereInput[]
    NOT?: DailyRiskCounterWhereInput | DailyRiskCounterWhereInput[]
    realizedPnl?: FloatFilter<"DailyRiskCounter"> | number
    tradesOpened?: IntFilter<"DailyRiskCounter"> | number
  }, "id" | "date">

  export type DailyRiskCounterOrderByWithAggregationInput = {
    id?: SortOrder
    date?: SortOrder
    realizedPnl?: SortOrder
    tradesOpened?: SortOrder
    _count?: DailyRiskCounterCountOrderByAggregateInput
    _avg?: DailyRiskCounterAvgOrderByAggregateInput
    _max?: DailyRiskCounterMaxOrderByAggregateInput
    _min?: DailyRiskCounterMinOrderByAggregateInput
    _sum?: DailyRiskCounterSumOrderByAggregateInput
  }

  export type DailyRiskCounterScalarWhereWithAggregatesInput = {
    AND?: DailyRiskCounterScalarWhereWithAggregatesInput | DailyRiskCounterScalarWhereWithAggregatesInput[]
    OR?: DailyRiskCounterScalarWhereWithAggregatesInput[]
    NOT?: DailyRiskCounterScalarWhereWithAggregatesInput | DailyRiskCounterScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DailyRiskCounter"> | string
    date?: DateTimeWithAggregatesFilter<"DailyRiskCounter"> | Date | string
    realizedPnl?: FloatWithAggregatesFilter<"DailyRiskCounter"> | number
    tradesOpened?: IntWithAggregatesFilter<"DailyRiskCounter"> | number
  }

  export type TradeCreateInput = {
    id?: string
    ticket: bigint | number
    symbol: string
    side: $Enums.TradeSide
    volume: number
    openPrice: number
    closePrice?: number | null
    stopLoss?: number | null
    takeProfit?: number | null
    commission?: number
    swap?: number
    grossProfit?: number
    netProfit?: number
    pips?: number | null
    strategy?: string | null
    magic?: number | null
    comment?: string | null
    status?: $Enums.TradeStatus
    openedAt: Date | string
    closedAt?: Date | string | null
    createdAt?: Date | string
    decisions?: DecisionLogCreateNestedManyWithoutTradeInput
  }

  export type TradeUncheckedCreateInput = {
    id?: string
    ticket: bigint | number
    symbol: string
    side: $Enums.TradeSide
    volume: number
    openPrice: number
    closePrice?: number | null
    stopLoss?: number | null
    takeProfit?: number | null
    commission?: number
    swap?: number
    grossProfit?: number
    netProfit?: number
    pips?: number | null
    strategy?: string | null
    magic?: number | null
    comment?: string | null
    status?: $Enums.TradeStatus
    openedAt: Date | string
    closedAt?: Date | string | null
    createdAt?: Date | string
    decisions?: DecisionLogUncheckedCreateNestedManyWithoutTradeInput
  }

  export type TradeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticket?: BigIntFieldUpdateOperationsInput | bigint | number
    symbol?: StringFieldUpdateOperationsInput | string
    side?: EnumTradeSideFieldUpdateOperationsInput | $Enums.TradeSide
    volume?: FloatFieldUpdateOperationsInput | number
    openPrice?: FloatFieldUpdateOperationsInput | number
    closePrice?: NullableFloatFieldUpdateOperationsInput | number | null
    stopLoss?: NullableFloatFieldUpdateOperationsInput | number | null
    takeProfit?: NullableFloatFieldUpdateOperationsInput | number | null
    commission?: FloatFieldUpdateOperationsInput | number
    swap?: FloatFieldUpdateOperationsInput | number
    grossProfit?: FloatFieldUpdateOperationsInput | number
    netProfit?: FloatFieldUpdateOperationsInput | number
    pips?: NullableFloatFieldUpdateOperationsInput | number | null
    strategy?: NullableStringFieldUpdateOperationsInput | string | null
    magic?: NullableIntFieldUpdateOperationsInput | number | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumTradeStatusFieldUpdateOperationsInput | $Enums.TradeStatus
    openedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    decisions?: DecisionLogUpdateManyWithoutTradeNestedInput
  }

  export type TradeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticket?: BigIntFieldUpdateOperationsInput | bigint | number
    symbol?: StringFieldUpdateOperationsInput | string
    side?: EnumTradeSideFieldUpdateOperationsInput | $Enums.TradeSide
    volume?: FloatFieldUpdateOperationsInput | number
    openPrice?: FloatFieldUpdateOperationsInput | number
    closePrice?: NullableFloatFieldUpdateOperationsInput | number | null
    stopLoss?: NullableFloatFieldUpdateOperationsInput | number | null
    takeProfit?: NullableFloatFieldUpdateOperationsInput | number | null
    commission?: FloatFieldUpdateOperationsInput | number
    swap?: FloatFieldUpdateOperationsInput | number
    grossProfit?: FloatFieldUpdateOperationsInput | number
    netProfit?: FloatFieldUpdateOperationsInput | number
    pips?: NullableFloatFieldUpdateOperationsInput | number | null
    strategy?: NullableStringFieldUpdateOperationsInput | string | null
    magic?: NullableIntFieldUpdateOperationsInput | number | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumTradeStatusFieldUpdateOperationsInput | $Enums.TradeStatus
    openedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    decisions?: DecisionLogUncheckedUpdateManyWithoutTradeNestedInput
  }

  export type TradeCreateManyInput = {
    id?: string
    ticket: bigint | number
    symbol: string
    side: $Enums.TradeSide
    volume: number
    openPrice: number
    closePrice?: number | null
    stopLoss?: number | null
    takeProfit?: number | null
    commission?: number
    swap?: number
    grossProfit?: number
    netProfit?: number
    pips?: number | null
    strategy?: string | null
    magic?: number | null
    comment?: string | null
    status?: $Enums.TradeStatus
    openedAt: Date | string
    closedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type TradeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticket?: BigIntFieldUpdateOperationsInput | bigint | number
    symbol?: StringFieldUpdateOperationsInput | string
    side?: EnumTradeSideFieldUpdateOperationsInput | $Enums.TradeSide
    volume?: FloatFieldUpdateOperationsInput | number
    openPrice?: FloatFieldUpdateOperationsInput | number
    closePrice?: NullableFloatFieldUpdateOperationsInput | number | null
    stopLoss?: NullableFloatFieldUpdateOperationsInput | number | null
    takeProfit?: NullableFloatFieldUpdateOperationsInput | number | null
    commission?: FloatFieldUpdateOperationsInput | number
    swap?: FloatFieldUpdateOperationsInput | number
    grossProfit?: FloatFieldUpdateOperationsInput | number
    netProfit?: FloatFieldUpdateOperationsInput | number
    pips?: NullableFloatFieldUpdateOperationsInput | number | null
    strategy?: NullableStringFieldUpdateOperationsInput | string | null
    magic?: NullableIntFieldUpdateOperationsInput | number | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumTradeStatusFieldUpdateOperationsInput | $Enums.TradeStatus
    openedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TradeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticket?: BigIntFieldUpdateOperationsInput | bigint | number
    symbol?: StringFieldUpdateOperationsInput | string
    side?: EnumTradeSideFieldUpdateOperationsInput | $Enums.TradeSide
    volume?: FloatFieldUpdateOperationsInput | number
    openPrice?: FloatFieldUpdateOperationsInput | number
    closePrice?: NullableFloatFieldUpdateOperationsInput | number | null
    stopLoss?: NullableFloatFieldUpdateOperationsInput | number | null
    takeProfit?: NullableFloatFieldUpdateOperationsInput | number | null
    commission?: FloatFieldUpdateOperationsInput | number
    swap?: FloatFieldUpdateOperationsInput | number
    grossProfit?: FloatFieldUpdateOperationsInput | number
    netProfit?: FloatFieldUpdateOperationsInput | number
    pips?: NullableFloatFieldUpdateOperationsInput | number | null
    strategy?: NullableStringFieldUpdateOperationsInput | string | null
    magic?: NullableIntFieldUpdateOperationsInput | number | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumTradeStatusFieldUpdateOperationsInput | $Enums.TradeStatus
    openedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PositionCreateInput = {
    id?: string
    ticket: bigint | number
    symbol: string
    side: $Enums.TradeSide
    volume: number
    openPrice: number
    currentPrice: number
    stopLoss?: number | null
    takeProfit?: number | null
    swap?: number
    commission?: number
    unrealizedProfit?: number
    openedAt: Date | string
    updatedAt?: Date | string
  }

  export type PositionUncheckedCreateInput = {
    id?: string
    ticket: bigint | number
    symbol: string
    side: $Enums.TradeSide
    volume: number
    openPrice: number
    currentPrice: number
    stopLoss?: number | null
    takeProfit?: number | null
    swap?: number
    commission?: number
    unrealizedProfit?: number
    openedAt: Date | string
    updatedAt?: Date | string
  }

  export type PositionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticket?: BigIntFieldUpdateOperationsInput | bigint | number
    symbol?: StringFieldUpdateOperationsInput | string
    side?: EnumTradeSideFieldUpdateOperationsInput | $Enums.TradeSide
    volume?: FloatFieldUpdateOperationsInput | number
    openPrice?: FloatFieldUpdateOperationsInput | number
    currentPrice?: FloatFieldUpdateOperationsInput | number
    stopLoss?: NullableFloatFieldUpdateOperationsInput | number | null
    takeProfit?: NullableFloatFieldUpdateOperationsInput | number | null
    swap?: FloatFieldUpdateOperationsInput | number
    commission?: FloatFieldUpdateOperationsInput | number
    unrealizedProfit?: FloatFieldUpdateOperationsInput | number
    openedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PositionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticket?: BigIntFieldUpdateOperationsInput | bigint | number
    symbol?: StringFieldUpdateOperationsInput | string
    side?: EnumTradeSideFieldUpdateOperationsInput | $Enums.TradeSide
    volume?: FloatFieldUpdateOperationsInput | number
    openPrice?: FloatFieldUpdateOperationsInput | number
    currentPrice?: FloatFieldUpdateOperationsInput | number
    stopLoss?: NullableFloatFieldUpdateOperationsInput | number | null
    takeProfit?: NullableFloatFieldUpdateOperationsInput | number | null
    swap?: FloatFieldUpdateOperationsInput | number
    commission?: FloatFieldUpdateOperationsInput | number
    unrealizedProfit?: FloatFieldUpdateOperationsInput | number
    openedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PositionCreateManyInput = {
    id?: string
    ticket: bigint | number
    symbol: string
    side: $Enums.TradeSide
    volume: number
    openPrice: number
    currentPrice: number
    stopLoss?: number | null
    takeProfit?: number | null
    swap?: number
    commission?: number
    unrealizedProfit?: number
    openedAt: Date | string
    updatedAt?: Date | string
  }

  export type PositionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticket?: BigIntFieldUpdateOperationsInput | bigint | number
    symbol?: StringFieldUpdateOperationsInput | string
    side?: EnumTradeSideFieldUpdateOperationsInput | $Enums.TradeSide
    volume?: FloatFieldUpdateOperationsInput | number
    openPrice?: FloatFieldUpdateOperationsInput | number
    currentPrice?: FloatFieldUpdateOperationsInput | number
    stopLoss?: NullableFloatFieldUpdateOperationsInput | number | null
    takeProfit?: NullableFloatFieldUpdateOperationsInput | number | null
    swap?: FloatFieldUpdateOperationsInput | number
    commission?: FloatFieldUpdateOperationsInput | number
    unrealizedProfit?: FloatFieldUpdateOperationsInput | number
    openedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PositionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticket?: BigIntFieldUpdateOperationsInput | bigint | number
    symbol?: StringFieldUpdateOperationsInput | string
    side?: EnumTradeSideFieldUpdateOperationsInput | $Enums.TradeSide
    volume?: FloatFieldUpdateOperationsInput | number
    openPrice?: FloatFieldUpdateOperationsInput | number
    currentPrice?: FloatFieldUpdateOperationsInput | number
    stopLoss?: NullableFloatFieldUpdateOperationsInput | number | null
    takeProfit?: NullableFloatFieldUpdateOperationsInput | number | null
    swap?: FloatFieldUpdateOperationsInput | number
    commission?: FloatFieldUpdateOperationsInput | number
    unrealizedProfit?: FloatFieldUpdateOperationsInput | number
    openedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignalCreateInput = {
    id?: string
    symbol: string
    timeframe: string
    direction?: $Enums.SignalDirection
    score: number
    acted?: boolean
    indicators?: NullableJsonNullValueInput | InputJsonValue
    evaluation?: NullableJsonNullValueInput | InputJsonValue
    generatedAt?: Date | string
    decisions?: DecisionLogCreateNestedManyWithoutSignalInput
  }

  export type SignalUncheckedCreateInput = {
    id?: string
    symbol: string
    timeframe: string
    direction?: $Enums.SignalDirection
    score: number
    acted?: boolean
    indicators?: NullableJsonNullValueInput | InputJsonValue
    evaluation?: NullableJsonNullValueInput | InputJsonValue
    generatedAt?: Date | string
    decisions?: DecisionLogUncheckedCreateNestedManyWithoutSignalInput
  }

  export type SignalUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    timeframe?: StringFieldUpdateOperationsInput | string
    direction?: EnumSignalDirectionFieldUpdateOperationsInput | $Enums.SignalDirection
    score?: FloatFieldUpdateOperationsInput | number
    acted?: BoolFieldUpdateOperationsInput | boolean
    indicators?: NullableJsonNullValueInput | InputJsonValue
    evaluation?: NullableJsonNullValueInput | InputJsonValue
    generatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    decisions?: DecisionLogUpdateManyWithoutSignalNestedInput
  }

  export type SignalUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    timeframe?: StringFieldUpdateOperationsInput | string
    direction?: EnumSignalDirectionFieldUpdateOperationsInput | $Enums.SignalDirection
    score?: FloatFieldUpdateOperationsInput | number
    acted?: BoolFieldUpdateOperationsInput | boolean
    indicators?: NullableJsonNullValueInput | InputJsonValue
    evaluation?: NullableJsonNullValueInput | InputJsonValue
    generatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    decisions?: DecisionLogUncheckedUpdateManyWithoutSignalNestedInput
  }

  export type SignalCreateManyInput = {
    id?: string
    symbol: string
    timeframe: string
    direction?: $Enums.SignalDirection
    score: number
    acted?: boolean
    indicators?: NullableJsonNullValueInput | InputJsonValue
    evaluation?: NullableJsonNullValueInput | InputJsonValue
    generatedAt?: Date | string
  }

  export type SignalUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    timeframe?: StringFieldUpdateOperationsInput | string
    direction?: EnumSignalDirectionFieldUpdateOperationsInput | $Enums.SignalDirection
    score?: FloatFieldUpdateOperationsInput | number
    acted?: BoolFieldUpdateOperationsInput | boolean
    indicators?: NullableJsonNullValueInput | InputJsonValue
    evaluation?: NullableJsonNullValueInput | InputJsonValue
    generatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignalUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    timeframe?: StringFieldUpdateOperationsInput | string
    direction?: EnumSignalDirectionFieldUpdateOperationsInput | $Enums.SignalDirection
    score?: FloatFieldUpdateOperationsInput | number
    acted?: BoolFieldUpdateOperationsInput | boolean
    indicators?: NullableJsonNullValueInput | InputJsonValue
    evaluation?: NullableJsonNullValueInput | InputJsonValue
    generatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountSnapshotCreateInput = {
    id?: string
    balance: number
    equity: number
    margin?: number
    freeMargin?: number
    marginLevel?: number | null
    currency?: string
    leverage?: number | null
    capturedAt?: Date | string
  }

  export type AccountSnapshotUncheckedCreateInput = {
    id?: string
    balance: number
    equity: number
    margin?: number
    freeMargin?: number
    marginLevel?: number | null
    currency?: string
    leverage?: number | null
    capturedAt?: Date | string
  }

  export type AccountSnapshotUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    balance?: FloatFieldUpdateOperationsInput | number
    equity?: FloatFieldUpdateOperationsInput | number
    margin?: FloatFieldUpdateOperationsInput | number
    freeMargin?: FloatFieldUpdateOperationsInput | number
    marginLevel?: NullableFloatFieldUpdateOperationsInput | number | null
    currency?: StringFieldUpdateOperationsInput | string
    leverage?: NullableIntFieldUpdateOperationsInput | number | null
    capturedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountSnapshotUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    balance?: FloatFieldUpdateOperationsInput | number
    equity?: FloatFieldUpdateOperationsInput | number
    margin?: FloatFieldUpdateOperationsInput | number
    freeMargin?: FloatFieldUpdateOperationsInput | number
    marginLevel?: NullableFloatFieldUpdateOperationsInput | number | null
    currency?: StringFieldUpdateOperationsInput | string
    leverage?: NullableIntFieldUpdateOperationsInput | number | null
    capturedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountSnapshotCreateManyInput = {
    id?: string
    balance: number
    equity: number
    margin?: number
    freeMargin?: number
    marginLevel?: number | null
    currency?: string
    leverage?: number | null
    capturedAt?: Date | string
  }

  export type AccountSnapshotUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    balance?: FloatFieldUpdateOperationsInput | number
    equity?: FloatFieldUpdateOperationsInput | number
    margin?: FloatFieldUpdateOperationsInput | number
    freeMargin?: FloatFieldUpdateOperationsInput | number
    marginLevel?: NullableFloatFieldUpdateOperationsInput | number | null
    currency?: StringFieldUpdateOperationsInput | string
    leverage?: NullableIntFieldUpdateOperationsInput | number | null
    capturedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountSnapshotUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    balance?: FloatFieldUpdateOperationsInput | number
    equity?: FloatFieldUpdateOperationsInput | number
    margin?: FloatFieldUpdateOperationsInput | number
    freeMargin?: FloatFieldUpdateOperationsInput | number
    marginLevel?: NullableFloatFieldUpdateOperationsInput | number | null
    currency?: StringFieldUpdateOperationsInput | string
    leverage?: NullableIntFieldUpdateOperationsInput | number | null
    capturedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RiskSnapshotCreateInput = {
    id?: string
    dailyPnl?: number
    dailyDrawdownPct?: number
    maxDrawdownPct?: number
    openRiskPct?: number
    exposurePct?: number
    riskPerTradePct?: number
    openPositions?: number
    marginLevel?: number | null
    capturedAt?: Date | string
  }

  export type RiskSnapshotUncheckedCreateInput = {
    id?: string
    dailyPnl?: number
    dailyDrawdownPct?: number
    maxDrawdownPct?: number
    openRiskPct?: number
    exposurePct?: number
    riskPerTradePct?: number
    openPositions?: number
    marginLevel?: number | null
    capturedAt?: Date | string
  }

  export type RiskSnapshotUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    dailyPnl?: FloatFieldUpdateOperationsInput | number
    dailyDrawdownPct?: FloatFieldUpdateOperationsInput | number
    maxDrawdownPct?: FloatFieldUpdateOperationsInput | number
    openRiskPct?: FloatFieldUpdateOperationsInput | number
    exposurePct?: FloatFieldUpdateOperationsInput | number
    riskPerTradePct?: FloatFieldUpdateOperationsInput | number
    openPositions?: IntFieldUpdateOperationsInput | number
    marginLevel?: NullableFloatFieldUpdateOperationsInput | number | null
    capturedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RiskSnapshotUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    dailyPnl?: FloatFieldUpdateOperationsInput | number
    dailyDrawdownPct?: FloatFieldUpdateOperationsInput | number
    maxDrawdownPct?: FloatFieldUpdateOperationsInput | number
    openRiskPct?: FloatFieldUpdateOperationsInput | number
    exposurePct?: FloatFieldUpdateOperationsInput | number
    riskPerTradePct?: FloatFieldUpdateOperationsInput | number
    openPositions?: IntFieldUpdateOperationsInput | number
    marginLevel?: NullableFloatFieldUpdateOperationsInput | number | null
    capturedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RiskSnapshotCreateManyInput = {
    id?: string
    dailyPnl?: number
    dailyDrawdownPct?: number
    maxDrawdownPct?: number
    openRiskPct?: number
    exposurePct?: number
    riskPerTradePct?: number
    openPositions?: number
    marginLevel?: number | null
    capturedAt?: Date | string
  }

  export type RiskSnapshotUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    dailyPnl?: FloatFieldUpdateOperationsInput | number
    dailyDrawdownPct?: FloatFieldUpdateOperationsInput | number
    maxDrawdownPct?: FloatFieldUpdateOperationsInput | number
    openRiskPct?: FloatFieldUpdateOperationsInput | number
    exposurePct?: FloatFieldUpdateOperationsInput | number
    riskPerTradePct?: FloatFieldUpdateOperationsInput | number
    openPositions?: IntFieldUpdateOperationsInput | number
    marginLevel?: NullableFloatFieldUpdateOperationsInput | number | null
    capturedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RiskSnapshotUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    dailyPnl?: FloatFieldUpdateOperationsInput | number
    dailyDrawdownPct?: FloatFieldUpdateOperationsInput | number
    maxDrawdownPct?: FloatFieldUpdateOperationsInput | number
    openRiskPct?: FloatFieldUpdateOperationsInput | number
    exposurePct?: FloatFieldUpdateOperationsInput | number
    riskPerTradePct?: FloatFieldUpdateOperationsInput | number
    openPositions?: IntFieldUpdateOperationsInput | number
    marginLevel?: NullableFloatFieldUpdateOperationsInput | number | null
    capturedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MarketCandleCreateInput = {
    id?: string
    symbol: string
    timeframe: string
    openTime: Date | string
    open: number
    high: number
    low: number
    close: number
    volume?: number
    spread?: number | null
  }

  export type MarketCandleUncheckedCreateInput = {
    id?: string
    symbol: string
    timeframe: string
    openTime: Date | string
    open: number
    high: number
    low: number
    close: number
    volume?: number
    spread?: number | null
  }

  export type MarketCandleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    timeframe?: StringFieldUpdateOperationsInput | string
    openTime?: DateTimeFieldUpdateOperationsInput | Date | string
    open?: FloatFieldUpdateOperationsInput | number
    high?: FloatFieldUpdateOperationsInput | number
    low?: FloatFieldUpdateOperationsInput | number
    close?: FloatFieldUpdateOperationsInput | number
    volume?: FloatFieldUpdateOperationsInput | number
    spread?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type MarketCandleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    timeframe?: StringFieldUpdateOperationsInput | string
    openTime?: DateTimeFieldUpdateOperationsInput | Date | string
    open?: FloatFieldUpdateOperationsInput | number
    high?: FloatFieldUpdateOperationsInput | number
    low?: FloatFieldUpdateOperationsInput | number
    close?: FloatFieldUpdateOperationsInput | number
    volume?: FloatFieldUpdateOperationsInput | number
    spread?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type MarketCandleCreateManyInput = {
    id?: string
    symbol: string
    timeframe: string
    openTime: Date | string
    open: number
    high: number
    low: number
    close: number
    volume?: number
    spread?: number | null
  }

  export type MarketCandleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    timeframe?: StringFieldUpdateOperationsInput | string
    openTime?: DateTimeFieldUpdateOperationsInput | Date | string
    open?: FloatFieldUpdateOperationsInput | number
    high?: FloatFieldUpdateOperationsInput | number
    low?: FloatFieldUpdateOperationsInput | number
    close?: FloatFieldUpdateOperationsInput | number
    volume?: FloatFieldUpdateOperationsInput | number
    spread?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type MarketCandleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    timeframe?: StringFieldUpdateOperationsInput | string
    openTime?: DateTimeFieldUpdateOperationsInput | Date | string
    open?: FloatFieldUpdateOperationsInput | number
    high?: FloatFieldUpdateOperationsInput | number
    low?: FloatFieldUpdateOperationsInput | number
    close?: FloatFieldUpdateOperationsInput | number
    volume?: FloatFieldUpdateOperationsInput | number
    spread?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type LogEntryCreateInput = {
    id?: string
    level?: $Enums.LogLevel
    logger?: string | null
    message: string
    context?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type LogEntryUncheckedCreateInput = {
    id?: string
    level?: $Enums.LogLevel
    logger?: string | null
    message: string
    context?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type LogEntryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    level?: EnumLogLevelFieldUpdateOperationsInput | $Enums.LogLevel
    logger?: NullableStringFieldUpdateOperationsInput | string | null
    message?: StringFieldUpdateOperationsInput | string
    context?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LogEntryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    level?: EnumLogLevelFieldUpdateOperationsInput | $Enums.LogLevel
    logger?: NullableStringFieldUpdateOperationsInput | string | null
    message?: StringFieldUpdateOperationsInput | string
    context?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LogEntryCreateManyInput = {
    id?: string
    level?: $Enums.LogLevel
    logger?: string | null
    message: string
    context?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type LogEntryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    level?: EnumLogLevelFieldUpdateOperationsInput | $Enums.LogLevel
    logger?: NullableStringFieldUpdateOperationsInput | string | null
    message?: StringFieldUpdateOperationsInput | string
    context?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LogEntryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    level?: EnumLogLevelFieldUpdateOperationsInput | $Enums.LogLevel
    logger?: NullableStringFieldUpdateOperationsInput | string | null
    message?: StringFieldUpdateOperationsInput | string
    context?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JournalEntryCreateInput = {
    id?: string
    entryType: string
    symbol?: string | null
    title: string
    content?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type JournalEntryUncheckedCreateInput = {
    id?: string
    entryType: string
    symbol?: string | null
    title: string
    content?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type JournalEntryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    entryType?: StringFieldUpdateOperationsInput | string
    symbol?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    content?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JournalEntryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    entryType?: StringFieldUpdateOperationsInput | string
    symbol?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    content?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JournalEntryCreateManyInput = {
    id?: string
    entryType: string
    symbol?: string | null
    title: string
    content?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type JournalEntryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    entryType?: StringFieldUpdateOperationsInput | string
    symbol?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    content?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JournalEntryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    entryType?: StringFieldUpdateOperationsInput | string
    symbol?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    content?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationCreateInput = {
    id?: string
    channel: string
    level?: $Enums.LogLevel
    title: string
    body: string
    status?: $Enums.NotificationStatus
    sentAt?: Date | string | null
    createdAt?: Date | string
  }

  export type NotificationUncheckedCreateInput = {
    id?: string
    channel: string
    level?: $Enums.LogLevel
    title: string
    body: string
    status?: $Enums.NotificationStatus
    sentAt?: Date | string | null
    createdAt?: Date | string
  }

  export type NotificationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    channel?: StringFieldUpdateOperationsInput | string
    level?: EnumLogLevelFieldUpdateOperationsInput | $Enums.LogLevel
    title?: StringFieldUpdateOperationsInput | string
    body?: StringFieldUpdateOperationsInput | string
    status?: EnumNotificationStatusFieldUpdateOperationsInput | $Enums.NotificationStatus
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    channel?: StringFieldUpdateOperationsInput | string
    level?: EnumLogLevelFieldUpdateOperationsInput | $Enums.LogLevel
    title?: StringFieldUpdateOperationsInput | string
    body?: StringFieldUpdateOperationsInput | string
    status?: EnumNotificationStatusFieldUpdateOperationsInput | $Enums.NotificationStatus
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationCreateManyInput = {
    id?: string
    channel: string
    level?: $Enums.LogLevel
    title: string
    body: string
    status?: $Enums.NotificationStatus
    sentAt?: Date | string | null
    createdAt?: Date | string
  }

  export type NotificationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    channel?: StringFieldUpdateOperationsInput | string
    level?: EnumLogLevelFieldUpdateOperationsInput | $Enums.LogLevel
    title?: StringFieldUpdateOperationsInput | string
    body?: StringFieldUpdateOperationsInput | string
    status?: EnumNotificationStatusFieldUpdateOperationsInput | $Enums.NotificationStatus
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    channel?: StringFieldUpdateOperationsInput | string
    level?: EnumLogLevelFieldUpdateOperationsInput | $Enums.LogLevel
    title?: StringFieldUpdateOperationsInput | string
    body?: StringFieldUpdateOperationsInput | string
    status?: EnumNotificationStatusFieldUpdateOperationsInput | $Enums.NotificationStatus
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BotStateCreateInput = {
    id?: string
    mode?: $Enums.BotMode
    killSwitch?: boolean
    activeStrategy?: string | null
    maxOpenTrades?: number
    maxDailyLossPct?: number
    note?: string | null
    updatedBy?: string | null
    updatedAt?: Date | string
    createdAt?: Date | string
  }

  export type BotStateUncheckedCreateInput = {
    id?: string
    mode?: $Enums.BotMode
    killSwitch?: boolean
    activeStrategy?: string | null
    maxOpenTrades?: number
    maxDailyLossPct?: number
    note?: string | null
    updatedBy?: string | null
    updatedAt?: Date | string
    createdAt?: Date | string
  }

  export type BotStateUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    mode?: EnumBotModeFieldUpdateOperationsInput | $Enums.BotMode
    killSwitch?: BoolFieldUpdateOperationsInput | boolean
    activeStrategy?: NullableStringFieldUpdateOperationsInput | string | null
    maxOpenTrades?: IntFieldUpdateOperationsInput | number
    maxDailyLossPct?: FloatFieldUpdateOperationsInput | number
    note?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BotStateUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    mode?: EnumBotModeFieldUpdateOperationsInput | $Enums.BotMode
    killSwitch?: BoolFieldUpdateOperationsInput | boolean
    activeStrategy?: NullableStringFieldUpdateOperationsInput | string | null
    maxOpenTrades?: IntFieldUpdateOperationsInput | number
    maxDailyLossPct?: FloatFieldUpdateOperationsInput | number
    note?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BotStateCreateManyInput = {
    id?: string
    mode?: $Enums.BotMode
    killSwitch?: boolean
    activeStrategy?: string | null
    maxOpenTrades?: number
    maxDailyLossPct?: number
    note?: string | null
    updatedBy?: string | null
    updatedAt?: Date | string
    createdAt?: Date | string
  }

  export type BotStateUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    mode?: EnumBotModeFieldUpdateOperationsInput | $Enums.BotMode
    killSwitch?: BoolFieldUpdateOperationsInput | boolean
    activeStrategy?: NullableStringFieldUpdateOperationsInput | string | null
    maxOpenTrades?: IntFieldUpdateOperationsInput | number
    maxDailyLossPct?: FloatFieldUpdateOperationsInput | number
    note?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BotStateUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    mode?: EnumBotModeFieldUpdateOperationsInput | $Enums.BotMode
    killSwitch?: BoolFieldUpdateOperationsInput | boolean
    activeStrategy?: NullableStringFieldUpdateOperationsInput | string | null
    maxOpenTrades?: IntFieldUpdateOperationsInput | number
    maxDailyLossPct?: FloatFieldUpdateOperationsInput | number
    note?: NullableStringFieldUpdateOperationsInput | string | null
    updatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionWindowCreateInput = {
    id?: string
    sessionName: string
    startMinuteUtc: number
    endMinuteUtc: number
    enabled?: boolean
    tradingEnabled?: boolean
    symbols?: SessionWindowCreatesymbolsInput | string[]
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    decisions?: DecisionLogCreateNestedManyWithoutSessionWindowInput
  }

  export type SessionWindowUncheckedCreateInput = {
    id?: string
    sessionName: string
    startMinuteUtc: number
    endMinuteUtc: number
    enabled?: boolean
    tradingEnabled?: boolean
    symbols?: SessionWindowCreatesymbolsInput | string[]
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    decisions?: DecisionLogUncheckedCreateNestedManyWithoutSessionWindowInput
  }

  export type SessionWindowUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionName?: StringFieldUpdateOperationsInput | string
    startMinuteUtc?: IntFieldUpdateOperationsInput | number
    endMinuteUtc?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    tradingEnabled?: BoolFieldUpdateOperationsInput | boolean
    symbols?: SessionWindowUpdatesymbolsInput | string[]
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    decisions?: DecisionLogUpdateManyWithoutSessionWindowNestedInput
  }

  export type SessionWindowUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionName?: StringFieldUpdateOperationsInput | string
    startMinuteUtc?: IntFieldUpdateOperationsInput | number
    endMinuteUtc?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    tradingEnabled?: BoolFieldUpdateOperationsInput | boolean
    symbols?: SessionWindowUpdatesymbolsInput | string[]
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    decisions?: DecisionLogUncheckedUpdateManyWithoutSessionWindowNestedInput
  }

  export type SessionWindowCreateManyInput = {
    id?: string
    sessionName: string
    startMinuteUtc: number
    endMinuteUtc: number
    enabled?: boolean
    tradingEnabled?: boolean
    symbols?: SessionWindowCreatesymbolsInput | string[]
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SessionWindowUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionName?: StringFieldUpdateOperationsInput | string
    startMinuteUtc?: IntFieldUpdateOperationsInput | number
    endMinuteUtc?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    tradingEnabled?: BoolFieldUpdateOperationsInput | boolean
    symbols?: SessionWindowUpdatesymbolsInput | string[]
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionWindowUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionName?: StringFieldUpdateOperationsInput | string
    startMinuteUtc?: IntFieldUpdateOperationsInput | number
    endMinuteUtc?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    tradingEnabled?: BoolFieldUpdateOperationsInput | boolean
    symbols?: SessionWindowUpdatesymbolsInput | string[]
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DecisionLogCreateInput = {
    id?: string
    symbol: string
    timeframe?: string | null
    action?: $Enums.DecisionAction
    status?: $Enums.DecisionStatus
    model?: string | null
    inputPrompt: string
    outputDecision: string
    rationale?: string | null
    confidenceScore?: number | null
    proposedSl?: number | null
    proposedTp?: number | null
    proposedVolume?: number | null
    latencyMs?: number | null
    error?: string | null
    createdAt?: Date | string
    signal?: SignalCreateNestedOneWithoutDecisionsInput
    sessionWindow?: SessionWindowCreateNestedOneWithoutDecisionsInput
    pendingOrder?: PendingOrderCreateNestedOneWithoutDecisionInput
    trade?: TradeCreateNestedOneWithoutDecisionsInput
  }

  export type DecisionLogUncheckedCreateInput = {
    id?: string
    symbol: string
    timeframe?: string | null
    action?: $Enums.DecisionAction
    status?: $Enums.DecisionStatus
    model?: string | null
    inputPrompt: string
    outputDecision: string
    rationale?: string | null
    confidenceScore?: number | null
    proposedSl?: number | null
    proposedTp?: number | null
    proposedVolume?: number | null
    latencyMs?: number | null
    error?: string | null
    signalId?: string | null
    sessionWindowId?: string | null
    pendingOrderId?: string | null
    tradeId?: string | null
    createdAt?: Date | string
  }

  export type DecisionLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    action?: EnumDecisionActionFieldUpdateOperationsInput | $Enums.DecisionAction
    status?: EnumDecisionStatusFieldUpdateOperationsInput | $Enums.DecisionStatus
    model?: NullableStringFieldUpdateOperationsInput | string | null
    inputPrompt?: StringFieldUpdateOperationsInput | string
    outputDecision?: StringFieldUpdateOperationsInput | string
    rationale?: NullableStringFieldUpdateOperationsInput | string | null
    confidenceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedSl?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedTp?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedVolume?: NullableFloatFieldUpdateOperationsInput | number | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
    error?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    signal?: SignalUpdateOneWithoutDecisionsNestedInput
    sessionWindow?: SessionWindowUpdateOneWithoutDecisionsNestedInput
    pendingOrder?: PendingOrderUpdateOneWithoutDecisionNestedInput
    trade?: TradeUpdateOneWithoutDecisionsNestedInput
  }

  export type DecisionLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    action?: EnumDecisionActionFieldUpdateOperationsInput | $Enums.DecisionAction
    status?: EnumDecisionStatusFieldUpdateOperationsInput | $Enums.DecisionStatus
    model?: NullableStringFieldUpdateOperationsInput | string | null
    inputPrompt?: StringFieldUpdateOperationsInput | string
    outputDecision?: StringFieldUpdateOperationsInput | string
    rationale?: NullableStringFieldUpdateOperationsInput | string | null
    confidenceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedSl?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedTp?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedVolume?: NullableFloatFieldUpdateOperationsInput | number | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
    error?: NullableStringFieldUpdateOperationsInput | string | null
    signalId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionWindowId?: NullableStringFieldUpdateOperationsInput | string | null
    pendingOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    tradeId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DecisionLogCreateManyInput = {
    id?: string
    symbol: string
    timeframe?: string | null
    action?: $Enums.DecisionAction
    status?: $Enums.DecisionStatus
    model?: string | null
    inputPrompt: string
    outputDecision: string
    rationale?: string | null
    confidenceScore?: number | null
    proposedSl?: number | null
    proposedTp?: number | null
    proposedVolume?: number | null
    latencyMs?: number | null
    error?: string | null
    signalId?: string | null
    sessionWindowId?: string | null
    pendingOrderId?: string | null
    tradeId?: string | null
    createdAt?: Date | string
  }

  export type DecisionLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    action?: EnumDecisionActionFieldUpdateOperationsInput | $Enums.DecisionAction
    status?: EnumDecisionStatusFieldUpdateOperationsInput | $Enums.DecisionStatus
    model?: NullableStringFieldUpdateOperationsInput | string | null
    inputPrompt?: StringFieldUpdateOperationsInput | string
    outputDecision?: StringFieldUpdateOperationsInput | string
    rationale?: NullableStringFieldUpdateOperationsInput | string | null
    confidenceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedSl?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedTp?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedVolume?: NullableFloatFieldUpdateOperationsInput | number | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
    error?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DecisionLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    action?: EnumDecisionActionFieldUpdateOperationsInput | $Enums.DecisionAction
    status?: EnumDecisionStatusFieldUpdateOperationsInput | $Enums.DecisionStatus
    model?: NullableStringFieldUpdateOperationsInput | string | null
    inputPrompt?: StringFieldUpdateOperationsInput | string
    outputDecision?: StringFieldUpdateOperationsInput | string
    rationale?: NullableStringFieldUpdateOperationsInput | string | null
    confidenceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedSl?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedTp?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedVolume?: NullableFloatFieldUpdateOperationsInput | number | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
    error?: NullableStringFieldUpdateOperationsInput | string | null
    signalId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionWindowId?: NullableStringFieldUpdateOperationsInput | string | null
    pendingOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    tradeId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PendingOrderCreateInput = {
    id?: string
    ticket: bigint | number
    symbol: string
    type: $Enums.PendingOrderType
    status?: $Enums.PendingOrderStatus
    volume: number
    price: number
    stopLoss?: number | null
    takeProfit?: number | null
    magic?: number | null
    strategy?: string | null
    comment?: string | null
    placedAt?: Date | string
    expiresAt?: Date | string | null
    triggeredAt?: Date | string | null
    updatedAt?: Date | string
    decision?: DecisionLogCreateNestedOneWithoutPendingOrderInput
  }

  export type PendingOrderUncheckedCreateInput = {
    id?: string
    ticket: bigint | number
    symbol: string
    type: $Enums.PendingOrderType
    status?: $Enums.PendingOrderStatus
    volume: number
    price: number
    stopLoss?: number | null
    takeProfit?: number | null
    magic?: number | null
    strategy?: string | null
    comment?: string | null
    placedAt?: Date | string
    expiresAt?: Date | string | null
    triggeredAt?: Date | string | null
    updatedAt?: Date | string
    decision?: DecisionLogUncheckedCreateNestedOneWithoutPendingOrderInput
  }

  export type PendingOrderUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticket?: BigIntFieldUpdateOperationsInput | bigint | number
    symbol?: StringFieldUpdateOperationsInput | string
    type?: EnumPendingOrderTypeFieldUpdateOperationsInput | $Enums.PendingOrderType
    status?: EnumPendingOrderStatusFieldUpdateOperationsInput | $Enums.PendingOrderStatus
    volume?: FloatFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    stopLoss?: NullableFloatFieldUpdateOperationsInput | number | null
    takeProfit?: NullableFloatFieldUpdateOperationsInput | number | null
    magic?: NullableIntFieldUpdateOperationsInput | number | null
    strategy?: NullableStringFieldUpdateOperationsInput | string | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    placedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    triggeredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    decision?: DecisionLogUpdateOneWithoutPendingOrderNestedInput
  }

  export type PendingOrderUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticket?: BigIntFieldUpdateOperationsInput | bigint | number
    symbol?: StringFieldUpdateOperationsInput | string
    type?: EnumPendingOrderTypeFieldUpdateOperationsInput | $Enums.PendingOrderType
    status?: EnumPendingOrderStatusFieldUpdateOperationsInput | $Enums.PendingOrderStatus
    volume?: FloatFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    stopLoss?: NullableFloatFieldUpdateOperationsInput | number | null
    takeProfit?: NullableFloatFieldUpdateOperationsInput | number | null
    magic?: NullableIntFieldUpdateOperationsInput | number | null
    strategy?: NullableStringFieldUpdateOperationsInput | string | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    placedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    triggeredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    decision?: DecisionLogUncheckedUpdateOneWithoutPendingOrderNestedInput
  }

  export type PendingOrderCreateManyInput = {
    id?: string
    ticket: bigint | number
    symbol: string
    type: $Enums.PendingOrderType
    status?: $Enums.PendingOrderStatus
    volume: number
    price: number
    stopLoss?: number | null
    takeProfit?: number | null
    magic?: number | null
    strategy?: string | null
    comment?: string | null
    placedAt?: Date | string
    expiresAt?: Date | string | null
    triggeredAt?: Date | string | null
    updatedAt?: Date | string
  }

  export type PendingOrderUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticket?: BigIntFieldUpdateOperationsInput | bigint | number
    symbol?: StringFieldUpdateOperationsInput | string
    type?: EnumPendingOrderTypeFieldUpdateOperationsInput | $Enums.PendingOrderType
    status?: EnumPendingOrderStatusFieldUpdateOperationsInput | $Enums.PendingOrderStatus
    volume?: FloatFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    stopLoss?: NullableFloatFieldUpdateOperationsInput | number | null
    takeProfit?: NullableFloatFieldUpdateOperationsInput | number | null
    magic?: NullableIntFieldUpdateOperationsInput | number | null
    strategy?: NullableStringFieldUpdateOperationsInput | string | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    placedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    triggeredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PendingOrderUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticket?: BigIntFieldUpdateOperationsInput | bigint | number
    symbol?: StringFieldUpdateOperationsInput | string
    type?: EnumPendingOrderTypeFieldUpdateOperationsInput | $Enums.PendingOrderType
    status?: EnumPendingOrderStatusFieldUpdateOperationsInput | $Enums.PendingOrderStatus
    volume?: FloatFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    stopLoss?: NullableFloatFieldUpdateOperationsInput | number | null
    takeProfit?: NullableFloatFieldUpdateOperationsInput | number | null
    magic?: NullableIntFieldUpdateOperationsInput | number | null
    strategy?: NullableStringFieldUpdateOperationsInput | string | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    placedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    triggeredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BotHeartbeatCreateInput = {
    id?: string
    lastBeatAt?: Date | string
    loopCount?: bigint | number
    mode?: string | null
    killSwitch?: boolean
    note?: string | null
  }

  export type BotHeartbeatUncheckedCreateInput = {
    id?: string
    lastBeatAt?: Date | string
    loopCount?: bigint | number
    mode?: string | null
    killSwitch?: boolean
    note?: string | null
  }

  export type BotHeartbeatUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    lastBeatAt?: DateTimeFieldUpdateOperationsInput | Date | string
    loopCount?: BigIntFieldUpdateOperationsInput | bigint | number
    mode?: NullableStringFieldUpdateOperationsInput | string | null
    killSwitch?: BoolFieldUpdateOperationsInput | boolean
    note?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type BotHeartbeatUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    lastBeatAt?: DateTimeFieldUpdateOperationsInput | Date | string
    loopCount?: BigIntFieldUpdateOperationsInput | bigint | number
    mode?: NullableStringFieldUpdateOperationsInput | string | null
    killSwitch?: BoolFieldUpdateOperationsInput | boolean
    note?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type BotHeartbeatCreateManyInput = {
    id?: string
    lastBeatAt?: Date | string
    loopCount?: bigint | number
    mode?: string | null
    killSwitch?: boolean
    note?: string | null
  }

  export type BotHeartbeatUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    lastBeatAt?: DateTimeFieldUpdateOperationsInput | Date | string
    loopCount?: BigIntFieldUpdateOperationsInput | bigint | number
    mode?: NullableStringFieldUpdateOperationsInput | string | null
    killSwitch?: BoolFieldUpdateOperationsInput | boolean
    note?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type BotHeartbeatUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    lastBeatAt?: DateTimeFieldUpdateOperationsInput | Date | string
    loopCount?: BigIntFieldUpdateOperationsInput | bigint | number
    mode?: NullableStringFieldUpdateOperationsInput | string | null
    killSwitch?: BoolFieldUpdateOperationsInput | boolean
    note?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DailyRiskCounterCreateInput = {
    id?: string
    date?: Date | string
    realizedPnl?: number
    tradesOpened?: number
  }

  export type DailyRiskCounterUncheckedCreateInput = {
    id?: string
    date?: Date | string
    realizedPnl?: number
    tradesOpened?: number
  }

  export type DailyRiskCounterUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    realizedPnl?: FloatFieldUpdateOperationsInput | number
    tradesOpened?: IntFieldUpdateOperationsInput | number
  }

  export type DailyRiskCounterUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    realizedPnl?: FloatFieldUpdateOperationsInput | number
    tradesOpened?: IntFieldUpdateOperationsInput | number
  }

  export type DailyRiskCounterCreateManyInput = {
    id?: string
    date?: Date | string
    realizedPnl?: number
    tradesOpened?: number
  }

  export type DailyRiskCounterUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    realizedPnl?: FloatFieldUpdateOperationsInput | number
    tradesOpened?: IntFieldUpdateOperationsInput | number
  }

  export type DailyRiskCounterUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    realizedPnl?: FloatFieldUpdateOperationsInput | number
    tradesOpened?: IntFieldUpdateOperationsInput | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type BigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type EnumTradeSideFilter<$PrismaModel = never> = {
    equals?: $Enums.TradeSide | EnumTradeSideFieldRefInput<$PrismaModel>
    in?: $Enums.TradeSide[] | ListEnumTradeSideFieldRefInput<$PrismaModel>
    notIn?: $Enums.TradeSide[] | ListEnumTradeSideFieldRefInput<$PrismaModel>
    not?: NestedEnumTradeSideFilter<$PrismaModel> | $Enums.TradeSide
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type EnumTradeStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TradeStatus | EnumTradeStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TradeStatus[] | ListEnumTradeStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TradeStatus[] | ListEnumTradeStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTradeStatusFilter<$PrismaModel> | $Enums.TradeStatus
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type DecisionLogListRelationFilter = {
    every?: DecisionLogWhereInput
    some?: DecisionLogWhereInput
    none?: DecisionLogWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type DecisionLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TradeCountOrderByAggregateInput = {
    id?: SortOrder
    ticket?: SortOrder
    symbol?: SortOrder
    side?: SortOrder
    volume?: SortOrder
    openPrice?: SortOrder
    closePrice?: SortOrder
    stopLoss?: SortOrder
    takeProfit?: SortOrder
    commission?: SortOrder
    swap?: SortOrder
    grossProfit?: SortOrder
    netProfit?: SortOrder
    pips?: SortOrder
    strategy?: SortOrder
    magic?: SortOrder
    comment?: SortOrder
    status?: SortOrder
    openedAt?: SortOrder
    closedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type TradeAvgOrderByAggregateInput = {
    ticket?: SortOrder
    volume?: SortOrder
    openPrice?: SortOrder
    closePrice?: SortOrder
    stopLoss?: SortOrder
    takeProfit?: SortOrder
    commission?: SortOrder
    swap?: SortOrder
    grossProfit?: SortOrder
    netProfit?: SortOrder
    pips?: SortOrder
    magic?: SortOrder
  }

  export type TradeMaxOrderByAggregateInput = {
    id?: SortOrder
    ticket?: SortOrder
    symbol?: SortOrder
    side?: SortOrder
    volume?: SortOrder
    openPrice?: SortOrder
    closePrice?: SortOrder
    stopLoss?: SortOrder
    takeProfit?: SortOrder
    commission?: SortOrder
    swap?: SortOrder
    grossProfit?: SortOrder
    netProfit?: SortOrder
    pips?: SortOrder
    strategy?: SortOrder
    magic?: SortOrder
    comment?: SortOrder
    status?: SortOrder
    openedAt?: SortOrder
    closedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type TradeMinOrderByAggregateInput = {
    id?: SortOrder
    ticket?: SortOrder
    symbol?: SortOrder
    side?: SortOrder
    volume?: SortOrder
    openPrice?: SortOrder
    closePrice?: SortOrder
    stopLoss?: SortOrder
    takeProfit?: SortOrder
    commission?: SortOrder
    swap?: SortOrder
    grossProfit?: SortOrder
    netProfit?: SortOrder
    pips?: SortOrder
    strategy?: SortOrder
    magic?: SortOrder
    comment?: SortOrder
    status?: SortOrder
    openedAt?: SortOrder
    closedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type TradeSumOrderByAggregateInput = {
    ticket?: SortOrder
    volume?: SortOrder
    openPrice?: SortOrder
    closePrice?: SortOrder
    stopLoss?: SortOrder
    takeProfit?: SortOrder
    commission?: SortOrder
    swap?: SortOrder
    grossProfit?: SortOrder
    netProfit?: SortOrder
    pips?: SortOrder
    magic?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type BigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type EnumTradeSideWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TradeSide | EnumTradeSideFieldRefInput<$PrismaModel>
    in?: $Enums.TradeSide[] | ListEnumTradeSideFieldRefInput<$PrismaModel>
    notIn?: $Enums.TradeSide[] | ListEnumTradeSideFieldRefInput<$PrismaModel>
    not?: NestedEnumTradeSideWithAggregatesFilter<$PrismaModel> | $Enums.TradeSide
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTradeSideFilter<$PrismaModel>
    _max?: NestedEnumTradeSideFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type EnumTradeStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TradeStatus | EnumTradeStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TradeStatus[] | ListEnumTradeStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TradeStatus[] | ListEnumTradeStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTradeStatusWithAggregatesFilter<$PrismaModel> | $Enums.TradeStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTradeStatusFilter<$PrismaModel>
    _max?: NestedEnumTradeStatusFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type PositionCountOrderByAggregateInput = {
    id?: SortOrder
    ticket?: SortOrder
    symbol?: SortOrder
    side?: SortOrder
    volume?: SortOrder
    openPrice?: SortOrder
    currentPrice?: SortOrder
    stopLoss?: SortOrder
    takeProfit?: SortOrder
    swap?: SortOrder
    commission?: SortOrder
    unrealizedProfit?: SortOrder
    openedAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PositionAvgOrderByAggregateInput = {
    ticket?: SortOrder
    volume?: SortOrder
    openPrice?: SortOrder
    currentPrice?: SortOrder
    stopLoss?: SortOrder
    takeProfit?: SortOrder
    swap?: SortOrder
    commission?: SortOrder
    unrealizedProfit?: SortOrder
  }

  export type PositionMaxOrderByAggregateInput = {
    id?: SortOrder
    ticket?: SortOrder
    symbol?: SortOrder
    side?: SortOrder
    volume?: SortOrder
    openPrice?: SortOrder
    currentPrice?: SortOrder
    stopLoss?: SortOrder
    takeProfit?: SortOrder
    swap?: SortOrder
    commission?: SortOrder
    unrealizedProfit?: SortOrder
    openedAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PositionMinOrderByAggregateInput = {
    id?: SortOrder
    ticket?: SortOrder
    symbol?: SortOrder
    side?: SortOrder
    volume?: SortOrder
    openPrice?: SortOrder
    currentPrice?: SortOrder
    stopLoss?: SortOrder
    takeProfit?: SortOrder
    swap?: SortOrder
    commission?: SortOrder
    unrealizedProfit?: SortOrder
    openedAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PositionSumOrderByAggregateInput = {
    ticket?: SortOrder
    volume?: SortOrder
    openPrice?: SortOrder
    currentPrice?: SortOrder
    stopLoss?: SortOrder
    takeProfit?: SortOrder
    swap?: SortOrder
    commission?: SortOrder
    unrealizedProfit?: SortOrder
  }

  export type EnumSignalDirectionFilter<$PrismaModel = never> = {
    equals?: $Enums.SignalDirection | EnumSignalDirectionFieldRefInput<$PrismaModel>
    in?: $Enums.SignalDirection[] | ListEnumSignalDirectionFieldRefInput<$PrismaModel>
    notIn?: $Enums.SignalDirection[] | ListEnumSignalDirectionFieldRefInput<$PrismaModel>
    not?: NestedEnumSignalDirectionFilter<$PrismaModel> | $Enums.SignalDirection
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type SignalCountOrderByAggregateInput = {
    id?: SortOrder
    symbol?: SortOrder
    timeframe?: SortOrder
    direction?: SortOrder
    score?: SortOrder
    acted?: SortOrder
    indicators?: SortOrder
    evaluation?: SortOrder
    generatedAt?: SortOrder
  }

  export type SignalAvgOrderByAggregateInput = {
    score?: SortOrder
  }

  export type SignalMaxOrderByAggregateInput = {
    id?: SortOrder
    symbol?: SortOrder
    timeframe?: SortOrder
    direction?: SortOrder
    score?: SortOrder
    acted?: SortOrder
    generatedAt?: SortOrder
  }

  export type SignalMinOrderByAggregateInput = {
    id?: SortOrder
    symbol?: SortOrder
    timeframe?: SortOrder
    direction?: SortOrder
    score?: SortOrder
    acted?: SortOrder
    generatedAt?: SortOrder
  }

  export type SignalSumOrderByAggregateInput = {
    score?: SortOrder
  }

  export type EnumSignalDirectionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SignalDirection | EnumSignalDirectionFieldRefInput<$PrismaModel>
    in?: $Enums.SignalDirection[] | ListEnumSignalDirectionFieldRefInput<$PrismaModel>
    notIn?: $Enums.SignalDirection[] | ListEnumSignalDirectionFieldRefInput<$PrismaModel>
    not?: NestedEnumSignalDirectionWithAggregatesFilter<$PrismaModel> | $Enums.SignalDirection
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSignalDirectionFilter<$PrismaModel>
    _max?: NestedEnumSignalDirectionFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type AccountSnapshotCountOrderByAggregateInput = {
    id?: SortOrder
    balance?: SortOrder
    equity?: SortOrder
    margin?: SortOrder
    freeMargin?: SortOrder
    marginLevel?: SortOrder
    currency?: SortOrder
    leverage?: SortOrder
    capturedAt?: SortOrder
  }

  export type AccountSnapshotAvgOrderByAggregateInput = {
    balance?: SortOrder
    equity?: SortOrder
    margin?: SortOrder
    freeMargin?: SortOrder
    marginLevel?: SortOrder
    leverage?: SortOrder
  }

  export type AccountSnapshotMaxOrderByAggregateInput = {
    id?: SortOrder
    balance?: SortOrder
    equity?: SortOrder
    margin?: SortOrder
    freeMargin?: SortOrder
    marginLevel?: SortOrder
    currency?: SortOrder
    leverage?: SortOrder
    capturedAt?: SortOrder
  }

  export type AccountSnapshotMinOrderByAggregateInput = {
    id?: SortOrder
    balance?: SortOrder
    equity?: SortOrder
    margin?: SortOrder
    freeMargin?: SortOrder
    marginLevel?: SortOrder
    currency?: SortOrder
    leverage?: SortOrder
    capturedAt?: SortOrder
  }

  export type AccountSnapshotSumOrderByAggregateInput = {
    balance?: SortOrder
    equity?: SortOrder
    margin?: SortOrder
    freeMargin?: SortOrder
    marginLevel?: SortOrder
    leverage?: SortOrder
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type RiskSnapshotCountOrderByAggregateInput = {
    id?: SortOrder
    dailyPnl?: SortOrder
    dailyDrawdownPct?: SortOrder
    maxDrawdownPct?: SortOrder
    openRiskPct?: SortOrder
    exposurePct?: SortOrder
    riskPerTradePct?: SortOrder
    openPositions?: SortOrder
    marginLevel?: SortOrder
    capturedAt?: SortOrder
  }

  export type RiskSnapshotAvgOrderByAggregateInput = {
    dailyPnl?: SortOrder
    dailyDrawdownPct?: SortOrder
    maxDrawdownPct?: SortOrder
    openRiskPct?: SortOrder
    exposurePct?: SortOrder
    riskPerTradePct?: SortOrder
    openPositions?: SortOrder
    marginLevel?: SortOrder
  }

  export type RiskSnapshotMaxOrderByAggregateInput = {
    id?: SortOrder
    dailyPnl?: SortOrder
    dailyDrawdownPct?: SortOrder
    maxDrawdownPct?: SortOrder
    openRiskPct?: SortOrder
    exposurePct?: SortOrder
    riskPerTradePct?: SortOrder
    openPositions?: SortOrder
    marginLevel?: SortOrder
    capturedAt?: SortOrder
  }

  export type RiskSnapshotMinOrderByAggregateInput = {
    id?: SortOrder
    dailyPnl?: SortOrder
    dailyDrawdownPct?: SortOrder
    maxDrawdownPct?: SortOrder
    openRiskPct?: SortOrder
    exposurePct?: SortOrder
    riskPerTradePct?: SortOrder
    openPositions?: SortOrder
    marginLevel?: SortOrder
    capturedAt?: SortOrder
  }

  export type RiskSnapshotSumOrderByAggregateInput = {
    dailyPnl?: SortOrder
    dailyDrawdownPct?: SortOrder
    maxDrawdownPct?: SortOrder
    openRiskPct?: SortOrder
    exposurePct?: SortOrder
    riskPerTradePct?: SortOrder
    openPositions?: SortOrder
    marginLevel?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type MarketCandleSymbolTimeframeOpenTimeCompoundUniqueInput = {
    symbol: string
    timeframe: string
    openTime: Date | string
  }

  export type MarketCandleCountOrderByAggregateInput = {
    id?: SortOrder
    symbol?: SortOrder
    timeframe?: SortOrder
    openTime?: SortOrder
    open?: SortOrder
    high?: SortOrder
    low?: SortOrder
    close?: SortOrder
    volume?: SortOrder
    spread?: SortOrder
  }

  export type MarketCandleAvgOrderByAggregateInput = {
    open?: SortOrder
    high?: SortOrder
    low?: SortOrder
    close?: SortOrder
    volume?: SortOrder
    spread?: SortOrder
  }

  export type MarketCandleMaxOrderByAggregateInput = {
    id?: SortOrder
    symbol?: SortOrder
    timeframe?: SortOrder
    openTime?: SortOrder
    open?: SortOrder
    high?: SortOrder
    low?: SortOrder
    close?: SortOrder
    volume?: SortOrder
    spread?: SortOrder
  }

  export type MarketCandleMinOrderByAggregateInput = {
    id?: SortOrder
    symbol?: SortOrder
    timeframe?: SortOrder
    openTime?: SortOrder
    open?: SortOrder
    high?: SortOrder
    low?: SortOrder
    close?: SortOrder
    volume?: SortOrder
    spread?: SortOrder
  }

  export type MarketCandleSumOrderByAggregateInput = {
    open?: SortOrder
    high?: SortOrder
    low?: SortOrder
    close?: SortOrder
    volume?: SortOrder
    spread?: SortOrder
  }

  export type EnumLogLevelFilter<$PrismaModel = never> = {
    equals?: $Enums.LogLevel | EnumLogLevelFieldRefInput<$PrismaModel>
    in?: $Enums.LogLevel[] | ListEnumLogLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.LogLevel[] | ListEnumLogLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumLogLevelFilter<$PrismaModel> | $Enums.LogLevel
  }

  export type LogEntryCountOrderByAggregateInput = {
    id?: SortOrder
    level?: SortOrder
    logger?: SortOrder
    message?: SortOrder
    context?: SortOrder
    createdAt?: SortOrder
  }

  export type LogEntryMaxOrderByAggregateInput = {
    id?: SortOrder
    level?: SortOrder
    logger?: SortOrder
    message?: SortOrder
    createdAt?: SortOrder
  }

  export type LogEntryMinOrderByAggregateInput = {
    id?: SortOrder
    level?: SortOrder
    logger?: SortOrder
    message?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumLogLevelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LogLevel | EnumLogLevelFieldRefInput<$PrismaModel>
    in?: $Enums.LogLevel[] | ListEnumLogLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.LogLevel[] | ListEnumLogLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumLogLevelWithAggregatesFilter<$PrismaModel> | $Enums.LogLevel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumLogLevelFilter<$PrismaModel>
    _max?: NestedEnumLogLevelFilter<$PrismaModel>
  }

  export type JournalEntryCountOrderByAggregateInput = {
    id?: SortOrder
    entryType?: SortOrder
    symbol?: SortOrder
    title?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
  }

  export type JournalEntryMaxOrderByAggregateInput = {
    id?: SortOrder
    entryType?: SortOrder
    symbol?: SortOrder
    title?: SortOrder
    createdAt?: SortOrder
  }

  export type JournalEntryMinOrderByAggregateInput = {
    id?: SortOrder
    entryType?: SortOrder
    symbol?: SortOrder
    title?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumNotificationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.NotificationStatus | EnumNotificationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.NotificationStatus[] | ListEnumNotificationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.NotificationStatus[] | ListEnumNotificationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumNotificationStatusFilter<$PrismaModel> | $Enums.NotificationStatus
  }

  export type NotificationCountOrderByAggregateInput = {
    id?: SortOrder
    channel?: SortOrder
    level?: SortOrder
    title?: SortOrder
    body?: SortOrder
    status?: SortOrder
    sentAt?: SortOrder
    createdAt?: SortOrder
  }

  export type NotificationMaxOrderByAggregateInput = {
    id?: SortOrder
    channel?: SortOrder
    level?: SortOrder
    title?: SortOrder
    body?: SortOrder
    status?: SortOrder
    sentAt?: SortOrder
    createdAt?: SortOrder
  }

  export type NotificationMinOrderByAggregateInput = {
    id?: SortOrder
    channel?: SortOrder
    level?: SortOrder
    title?: SortOrder
    body?: SortOrder
    status?: SortOrder
    sentAt?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumNotificationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.NotificationStatus | EnumNotificationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.NotificationStatus[] | ListEnumNotificationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.NotificationStatus[] | ListEnumNotificationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumNotificationStatusWithAggregatesFilter<$PrismaModel> | $Enums.NotificationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumNotificationStatusFilter<$PrismaModel>
    _max?: NestedEnumNotificationStatusFilter<$PrismaModel>
  }

  export type EnumBotModeFilter<$PrismaModel = never> = {
    equals?: $Enums.BotMode | EnumBotModeFieldRefInput<$PrismaModel>
    in?: $Enums.BotMode[] | ListEnumBotModeFieldRefInput<$PrismaModel>
    notIn?: $Enums.BotMode[] | ListEnumBotModeFieldRefInput<$PrismaModel>
    not?: NestedEnumBotModeFilter<$PrismaModel> | $Enums.BotMode
  }

  export type BotStateCountOrderByAggregateInput = {
    id?: SortOrder
    mode?: SortOrder
    killSwitch?: SortOrder
    activeStrategy?: SortOrder
    maxOpenTrades?: SortOrder
    maxDailyLossPct?: SortOrder
    note?: SortOrder
    updatedBy?: SortOrder
    updatedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type BotStateAvgOrderByAggregateInput = {
    maxOpenTrades?: SortOrder
    maxDailyLossPct?: SortOrder
  }

  export type BotStateMaxOrderByAggregateInput = {
    id?: SortOrder
    mode?: SortOrder
    killSwitch?: SortOrder
    activeStrategy?: SortOrder
    maxOpenTrades?: SortOrder
    maxDailyLossPct?: SortOrder
    note?: SortOrder
    updatedBy?: SortOrder
    updatedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type BotStateMinOrderByAggregateInput = {
    id?: SortOrder
    mode?: SortOrder
    killSwitch?: SortOrder
    activeStrategy?: SortOrder
    maxOpenTrades?: SortOrder
    maxDailyLossPct?: SortOrder
    note?: SortOrder
    updatedBy?: SortOrder
    updatedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type BotStateSumOrderByAggregateInput = {
    maxOpenTrades?: SortOrder
    maxDailyLossPct?: SortOrder
  }

  export type EnumBotModeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BotMode | EnumBotModeFieldRefInput<$PrismaModel>
    in?: $Enums.BotMode[] | ListEnumBotModeFieldRefInput<$PrismaModel>
    notIn?: $Enums.BotMode[] | ListEnumBotModeFieldRefInput<$PrismaModel>
    not?: NestedEnumBotModeWithAggregatesFilter<$PrismaModel> | $Enums.BotMode
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBotModeFilter<$PrismaModel>
    _max?: NestedEnumBotModeFilter<$PrismaModel>
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type SessionWindowCountOrderByAggregateInput = {
    id?: SortOrder
    sessionName?: SortOrder
    startMinuteUtc?: SortOrder
    endMinuteUtc?: SortOrder
    enabled?: SortOrder
    tradingEnabled?: SortOrder
    symbols?: SortOrder
    note?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SessionWindowAvgOrderByAggregateInput = {
    startMinuteUtc?: SortOrder
    endMinuteUtc?: SortOrder
  }

  export type SessionWindowMaxOrderByAggregateInput = {
    id?: SortOrder
    sessionName?: SortOrder
    startMinuteUtc?: SortOrder
    endMinuteUtc?: SortOrder
    enabled?: SortOrder
    tradingEnabled?: SortOrder
    note?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SessionWindowMinOrderByAggregateInput = {
    id?: SortOrder
    sessionName?: SortOrder
    startMinuteUtc?: SortOrder
    endMinuteUtc?: SortOrder
    enabled?: SortOrder
    tradingEnabled?: SortOrder
    note?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SessionWindowSumOrderByAggregateInput = {
    startMinuteUtc?: SortOrder
    endMinuteUtc?: SortOrder
  }

  export type EnumDecisionActionFilter<$PrismaModel = never> = {
    equals?: $Enums.DecisionAction | EnumDecisionActionFieldRefInput<$PrismaModel>
    in?: $Enums.DecisionAction[] | ListEnumDecisionActionFieldRefInput<$PrismaModel>
    notIn?: $Enums.DecisionAction[] | ListEnumDecisionActionFieldRefInput<$PrismaModel>
    not?: NestedEnumDecisionActionFilter<$PrismaModel> | $Enums.DecisionAction
  }

  export type EnumDecisionStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.DecisionStatus | EnumDecisionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DecisionStatus[] | ListEnumDecisionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DecisionStatus[] | ListEnumDecisionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDecisionStatusFilter<$PrismaModel> | $Enums.DecisionStatus
  }

  export type SignalNullableScalarRelationFilter = {
    is?: SignalWhereInput | null
    isNot?: SignalWhereInput | null
  }

  export type SessionWindowNullableScalarRelationFilter = {
    is?: SessionWindowWhereInput | null
    isNot?: SessionWindowWhereInput | null
  }

  export type PendingOrderNullableScalarRelationFilter = {
    is?: PendingOrderWhereInput | null
    isNot?: PendingOrderWhereInput | null
  }

  export type TradeNullableScalarRelationFilter = {
    is?: TradeWhereInput | null
    isNot?: TradeWhereInput | null
  }

  export type DecisionLogCountOrderByAggregateInput = {
    id?: SortOrder
    symbol?: SortOrder
    timeframe?: SortOrder
    action?: SortOrder
    status?: SortOrder
    model?: SortOrder
    inputPrompt?: SortOrder
    outputDecision?: SortOrder
    rationale?: SortOrder
    confidenceScore?: SortOrder
    proposedSl?: SortOrder
    proposedTp?: SortOrder
    proposedVolume?: SortOrder
    latencyMs?: SortOrder
    error?: SortOrder
    signalId?: SortOrder
    sessionWindowId?: SortOrder
    pendingOrderId?: SortOrder
    tradeId?: SortOrder
    createdAt?: SortOrder
  }

  export type DecisionLogAvgOrderByAggregateInput = {
    confidenceScore?: SortOrder
    proposedSl?: SortOrder
    proposedTp?: SortOrder
    proposedVolume?: SortOrder
    latencyMs?: SortOrder
  }

  export type DecisionLogMaxOrderByAggregateInput = {
    id?: SortOrder
    symbol?: SortOrder
    timeframe?: SortOrder
    action?: SortOrder
    status?: SortOrder
    model?: SortOrder
    inputPrompt?: SortOrder
    outputDecision?: SortOrder
    rationale?: SortOrder
    confidenceScore?: SortOrder
    proposedSl?: SortOrder
    proposedTp?: SortOrder
    proposedVolume?: SortOrder
    latencyMs?: SortOrder
    error?: SortOrder
    signalId?: SortOrder
    sessionWindowId?: SortOrder
    pendingOrderId?: SortOrder
    tradeId?: SortOrder
    createdAt?: SortOrder
  }

  export type DecisionLogMinOrderByAggregateInput = {
    id?: SortOrder
    symbol?: SortOrder
    timeframe?: SortOrder
    action?: SortOrder
    status?: SortOrder
    model?: SortOrder
    inputPrompt?: SortOrder
    outputDecision?: SortOrder
    rationale?: SortOrder
    confidenceScore?: SortOrder
    proposedSl?: SortOrder
    proposedTp?: SortOrder
    proposedVolume?: SortOrder
    latencyMs?: SortOrder
    error?: SortOrder
    signalId?: SortOrder
    sessionWindowId?: SortOrder
    pendingOrderId?: SortOrder
    tradeId?: SortOrder
    createdAt?: SortOrder
  }

  export type DecisionLogSumOrderByAggregateInput = {
    confidenceScore?: SortOrder
    proposedSl?: SortOrder
    proposedTp?: SortOrder
    proposedVolume?: SortOrder
    latencyMs?: SortOrder
  }

  export type EnumDecisionActionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DecisionAction | EnumDecisionActionFieldRefInput<$PrismaModel>
    in?: $Enums.DecisionAction[] | ListEnumDecisionActionFieldRefInput<$PrismaModel>
    notIn?: $Enums.DecisionAction[] | ListEnumDecisionActionFieldRefInput<$PrismaModel>
    not?: NestedEnumDecisionActionWithAggregatesFilter<$PrismaModel> | $Enums.DecisionAction
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDecisionActionFilter<$PrismaModel>
    _max?: NestedEnumDecisionActionFilter<$PrismaModel>
  }

  export type EnumDecisionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DecisionStatus | EnumDecisionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DecisionStatus[] | ListEnumDecisionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DecisionStatus[] | ListEnumDecisionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDecisionStatusWithAggregatesFilter<$PrismaModel> | $Enums.DecisionStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDecisionStatusFilter<$PrismaModel>
    _max?: NestedEnumDecisionStatusFilter<$PrismaModel>
  }

  export type EnumPendingOrderTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.PendingOrderType | EnumPendingOrderTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PendingOrderType[] | ListEnumPendingOrderTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PendingOrderType[] | ListEnumPendingOrderTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPendingOrderTypeFilter<$PrismaModel> | $Enums.PendingOrderType
  }

  export type EnumPendingOrderStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PendingOrderStatus | EnumPendingOrderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PendingOrderStatus[] | ListEnumPendingOrderStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PendingOrderStatus[] | ListEnumPendingOrderStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPendingOrderStatusFilter<$PrismaModel> | $Enums.PendingOrderStatus
  }

  export type DecisionLogNullableScalarRelationFilter = {
    is?: DecisionLogWhereInput | null
    isNot?: DecisionLogWhereInput | null
  }

  export type PendingOrderCountOrderByAggregateInput = {
    id?: SortOrder
    ticket?: SortOrder
    symbol?: SortOrder
    type?: SortOrder
    status?: SortOrder
    volume?: SortOrder
    price?: SortOrder
    stopLoss?: SortOrder
    takeProfit?: SortOrder
    magic?: SortOrder
    strategy?: SortOrder
    comment?: SortOrder
    placedAt?: SortOrder
    expiresAt?: SortOrder
    triggeredAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PendingOrderAvgOrderByAggregateInput = {
    ticket?: SortOrder
    volume?: SortOrder
    price?: SortOrder
    stopLoss?: SortOrder
    takeProfit?: SortOrder
    magic?: SortOrder
  }

  export type PendingOrderMaxOrderByAggregateInput = {
    id?: SortOrder
    ticket?: SortOrder
    symbol?: SortOrder
    type?: SortOrder
    status?: SortOrder
    volume?: SortOrder
    price?: SortOrder
    stopLoss?: SortOrder
    takeProfit?: SortOrder
    magic?: SortOrder
    strategy?: SortOrder
    comment?: SortOrder
    placedAt?: SortOrder
    expiresAt?: SortOrder
    triggeredAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PendingOrderMinOrderByAggregateInput = {
    id?: SortOrder
    ticket?: SortOrder
    symbol?: SortOrder
    type?: SortOrder
    status?: SortOrder
    volume?: SortOrder
    price?: SortOrder
    stopLoss?: SortOrder
    takeProfit?: SortOrder
    magic?: SortOrder
    strategy?: SortOrder
    comment?: SortOrder
    placedAt?: SortOrder
    expiresAt?: SortOrder
    triggeredAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PendingOrderSumOrderByAggregateInput = {
    ticket?: SortOrder
    volume?: SortOrder
    price?: SortOrder
    stopLoss?: SortOrder
    takeProfit?: SortOrder
    magic?: SortOrder
  }

  export type EnumPendingOrderTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PendingOrderType | EnumPendingOrderTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PendingOrderType[] | ListEnumPendingOrderTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PendingOrderType[] | ListEnumPendingOrderTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPendingOrderTypeWithAggregatesFilter<$PrismaModel> | $Enums.PendingOrderType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPendingOrderTypeFilter<$PrismaModel>
    _max?: NestedEnumPendingOrderTypeFilter<$PrismaModel>
  }

  export type EnumPendingOrderStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PendingOrderStatus | EnumPendingOrderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PendingOrderStatus[] | ListEnumPendingOrderStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PendingOrderStatus[] | ListEnumPendingOrderStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPendingOrderStatusWithAggregatesFilter<$PrismaModel> | $Enums.PendingOrderStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPendingOrderStatusFilter<$PrismaModel>
    _max?: NestedEnumPendingOrderStatusFilter<$PrismaModel>
  }

  export type BotHeartbeatCountOrderByAggregateInput = {
    id?: SortOrder
    lastBeatAt?: SortOrder
    loopCount?: SortOrder
    mode?: SortOrder
    killSwitch?: SortOrder
    note?: SortOrder
  }

  export type BotHeartbeatAvgOrderByAggregateInput = {
    loopCount?: SortOrder
  }

  export type BotHeartbeatMaxOrderByAggregateInput = {
    id?: SortOrder
    lastBeatAt?: SortOrder
    loopCount?: SortOrder
    mode?: SortOrder
    killSwitch?: SortOrder
    note?: SortOrder
  }

  export type BotHeartbeatMinOrderByAggregateInput = {
    id?: SortOrder
    lastBeatAt?: SortOrder
    loopCount?: SortOrder
    mode?: SortOrder
    killSwitch?: SortOrder
    note?: SortOrder
  }

  export type BotHeartbeatSumOrderByAggregateInput = {
    loopCount?: SortOrder
  }

  export type DailyRiskCounterCountOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    realizedPnl?: SortOrder
    tradesOpened?: SortOrder
  }

  export type DailyRiskCounterAvgOrderByAggregateInput = {
    realizedPnl?: SortOrder
    tradesOpened?: SortOrder
  }

  export type DailyRiskCounterMaxOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    realizedPnl?: SortOrder
    tradesOpened?: SortOrder
  }

  export type DailyRiskCounterMinOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    realizedPnl?: SortOrder
    tradesOpened?: SortOrder
  }

  export type DailyRiskCounterSumOrderByAggregateInput = {
    realizedPnl?: SortOrder
    tradesOpened?: SortOrder
  }

  export type DecisionLogCreateNestedManyWithoutTradeInput = {
    create?: XOR<DecisionLogCreateWithoutTradeInput, DecisionLogUncheckedCreateWithoutTradeInput> | DecisionLogCreateWithoutTradeInput[] | DecisionLogUncheckedCreateWithoutTradeInput[]
    connectOrCreate?: DecisionLogCreateOrConnectWithoutTradeInput | DecisionLogCreateOrConnectWithoutTradeInput[]
    createMany?: DecisionLogCreateManyTradeInputEnvelope
    connect?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
  }

  export type DecisionLogUncheckedCreateNestedManyWithoutTradeInput = {
    create?: XOR<DecisionLogCreateWithoutTradeInput, DecisionLogUncheckedCreateWithoutTradeInput> | DecisionLogCreateWithoutTradeInput[] | DecisionLogUncheckedCreateWithoutTradeInput[]
    connectOrCreate?: DecisionLogCreateOrConnectWithoutTradeInput | DecisionLogCreateOrConnectWithoutTradeInput[]
    createMany?: DecisionLogCreateManyTradeInputEnvelope
    connect?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type BigIntFieldUpdateOperationsInput = {
    set?: bigint | number
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type EnumTradeSideFieldUpdateOperationsInput = {
    set?: $Enums.TradeSide
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumTradeStatusFieldUpdateOperationsInput = {
    set?: $Enums.TradeStatus
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type DecisionLogUpdateManyWithoutTradeNestedInput = {
    create?: XOR<DecisionLogCreateWithoutTradeInput, DecisionLogUncheckedCreateWithoutTradeInput> | DecisionLogCreateWithoutTradeInput[] | DecisionLogUncheckedCreateWithoutTradeInput[]
    connectOrCreate?: DecisionLogCreateOrConnectWithoutTradeInput | DecisionLogCreateOrConnectWithoutTradeInput[]
    upsert?: DecisionLogUpsertWithWhereUniqueWithoutTradeInput | DecisionLogUpsertWithWhereUniqueWithoutTradeInput[]
    createMany?: DecisionLogCreateManyTradeInputEnvelope
    set?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
    disconnect?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
    delete?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
    connect?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
    update?: DecisionLogUpdateWithWhereUniqueWithoutTradeInput | DecisionLogUpdateWithWhereUniqueWithoutTradeInput[]
    updateMany?: DecisionLogUpdateManyWithWhereWithoutTradeInput | DecisionLogUpdateManyWithWhereWithoutTradeInput[]
    deleteMany?: DecisionLogScalarWhereInput | DecisionLogScalarWhereInput[]
  }

  export type DecisionLogUncheckedUpdateManyWithoutTradeNestedInput = {
    create?: XOR<DecisionLogCreateWithoutTradeInput, DecisionLogUncheckedCreateWithoutTradeInput> | DecisionLogCreateWithoutTradeInput[] | DecisionLogUncheckedCreateWithoutTradeInput[]
    connectOrCreate?: DecisionLogCreateOrConnectWithoutTradeInput | DecisionLogCreateOrConnectWithoutTradeInput[]
    upsert?: DecisionLogUpsertWithWhereUniqueWithoutTradeInput | DecisionLogUpsertWithWhereUniqueWithoutTradeInput[]
    createMany?: DecisionLogCreateManyTradeInputEnvelope
    set?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
    disconnect?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
    delete?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
    connect?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
    update?: DecisionLogUpdateWithWhereUniqueWithoutTradeInput | DecisionLogUpdateWithWhereUniqueWithoutTradeInput[]
    updateMany?: DecisionLogUpdateManyWithWhereWithoutTradeInput | DecisionLogUpdateManyWithWhereWithoutTradeInput[]
    deleteMany?: DecisionLogScalarWhereInput | DecisionLogScalarWhereInput[]
  }

  export type DecisionLogCreateNestedManyWithoutSignalInput = {
    create?: XOR<DecisionLogCreateWithoutSignalInput, DecisionLogUncheckedCreateWithoutSignalInput> | DecisionLogCreateWithoutSignalInput[] | DecisionLogUncheckedCreateWithoutSignalInput[]
    connectOrCreate?: DecisionLogCreateOrConnectWithoutSignalInput | DecisionLogCreateOrConnectWithoutSignalInput[]
    createMany?: DecisionLogCreateManySignalInputEnvelope
    connect?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
  }

  export type DecisionLogUncheckedCreateNestedManyWithoutSignalInput = {
    create?: XOR<DecisionLogCreateWithoutSignalInput, DecisionLogUncheckedCreateWithoutSignalInput> | DecisionLogCreateWithoutSignalInput[] | DecisionLogUncheckedCreateWithoutSignalInput[]
    connectOrCreate?: DecisionLogCreateOrConnectWithoutSignalInput | DecisionLogCreateOrConnectWithoutSignalInput[]
    createMany?: DecisionLogCreateManySignalInputEnvelope
    connect?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
  }

  export type EnumSignalDirectionFieldUpdateOperationsInput = {
    set?: $Enums.SignalDirection
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DecisionLogUpdateManyWithoutSignalNestedInput = {
    create?: XOR<DecisionLogCreateWithoutSignalInput, DecisionLogUncheckedCreateWithoutSignalInput> | DecisionLogCreateWithoutSignalInput[] | DecisionLogUncheckedCreateWithoutSignalInput[]
    connectOrCreate?: DecisionLogCreateOrConnectWithoutSignalInput | DecisionLogCreateOrConnectWithoutSignalInput[]
    upsert?: DecisionLogUpsertWithWhereUniqueWithoutSignalInput | DecisionLogUpsertWithWhereUniqueWithoutSignalInput[]
    createMany?: DecisionLogCreateManySignalInputEnvelope
    set?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
    disconnect?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
    delete?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
    connect?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
    update?: DecisionLogUpdateWithWhereUniqueWithoutSignalInput | DecisionLogUpdateWithWhereUniqueWithoutSignalInput[]
    updateMany?: DecisionLogUpdateManyWithWhereWithoutSignalInput | DecisionLogUpdateManyWithWhereWithoutSignalInput[]
    deleteMany?: DecisionLogScalarWhereInput | DecisionLogScalarWhereInput[]
  }

  export type DecisionLogUncheckedUpdateManyWithoutSignalNestedInput = {
    create?: XOR<DecisionLogCreateWithoutSignalInput, DecisionLogUncheckedCreateWithoutSignalInput> | DecisionLogCreateWithoutSignalInput[] | DecisionLogUncheckedCreateWithoutSignalInput[]
    connectOrCreate?: DecisionLogCreateOrConnectWithoutSignalInput | DecisionLogCreateOrConnectWithoutSignalInput[]
    upsert?: DecisionLogUpsertWithWhereUniqueWithoutSignalInput | DecisionLogUpsertWithWhereUniqueWithoutSignalInput[]
    createMany?: DecisionLogCreateManySignalInputEnvelope
    set?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
    disconnect?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
    delete?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
    connect?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
    update?: DecisionLogUpdateWithWhereUniqueWithoutSignalInput | DecisionLogUpdateWithWhereUniqueWithoutSignalInput[]
    updateMany?: DecisionLogUpdateManyWithWhereWithoutSignalInput | DecisionLogUpdateManyWithWhereWithoutSignalInput[]
    deleteMany?: DecisionLogScalarWhereInput | DecisionLogScalarWhereInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumLogLevelFieldUpdateOperationsInput = {
    set?: $Enums.LogLevel
  }

  export type EnumNotificationStatusFieldUpdateOperationsInput = {
    set?: $Enums.NotificationStatus
  }

  export type EnumBotModeFieldUpdateOperationsInput = {
    set?: $Enums.BotMode
  }

  export type SessionWindowCreatesymbolsInput = {
    set: string[]
  }

  export type DecisionLogCreateNestedManyWithoutSessionWindowInput = {
    create?: XOR<DecisionLogCreateWithoutSessionWindowInput, DecisionLogUncheckedCreateWithoutSessionWindowInput> | DecisionLogCreateWithoutSessionWindowInput[] | DecisionLogUncheckedCreateWithoutSessionWindowInput[]
    connectOrCreate?: DecisionLogCreateOrConnectWithoutSessionWindowInput | DecisionLogCreateOrConnectWithoutSessionWindowInput[]
    createMany?: DecisionLogCreateManySessionWindowInputEnvelope
    connect?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
  }

  export type DecisionLogUncheckedCreateNestedManyWithoutSessionWindowInput = {
    create?: XOR<DecisionLogCreateWithoutSessionWindowInput, DecisionLogUncheckedCreateWithoutSessionWindowInput> | DecisionLogCreateWithoutSessionWindowInput[] | DecisionLogUncheckedCreateWithoutSessionWindowInput[]
    connectOrCreate?: DecisionLogCreateOrConnectWithoutSessionWindowInput | DecisionLogCreateOrConnectWithoutSessionWindowInput[]
    createMany?: DecisionLogCreateManySessionWindowInputEnvelope
    connect?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
  }

  export type SessionWindowUpdatesymbolsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type DecisionLogUpdateManyWithoutSessionWindowNestedInput = {
    create?: XOR<DecisionLogCreateWithoutSessionWindowInput, DecisionLogUncheckedCreateWithoutSessionWindowInput> | DecisionLogCreateWithoutSessionWindowInput[] | DecisionLogUncheckedCreateWithoutSessionWindowInput[]
    connectOrCreate?: DecisionLogCreateOrConnectWithoutSessionWindowInput | DecisionLogCreateOrConnectWithoutSessionWindowInput[]
    upsert?: DecisionLogUpsertWithWhereUniqueWithoutSessionWindowInput | DecisionLogUpsertWithWhereUniqueWithoutSessionWindowInput[]
    createMany?: DecisionLogCreateManySessionWindowInputEnvelope
    set?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
    disconnect?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
    delete?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
    connect?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
    update?: DecisionLogUpdateWithWhereUniqueWithoutSessionWindowInput | DecisionLogUpdateWithWhereUniqueWithoutSessionWindowInput[]
    updateMany?: DecisionLogUpdateManyWithWhereWithoutSessionWindowInput | DecisionLogUpdateManyWithWhereWithoutSessionWindowInput[]
    deleteMany?: DecisionLogScalarWhereInput | DecisionLogScalarWhereInput[]
  }

  export type DecisionLogUncheckedUpdateManyWithoutSessionWindowNestedInput = {
    create?: XOR<DecisionLogCreateWithoutSessionWindowInput, DecisionLogUncheckedCreateWithoutSessionWindowInput> | DecisionLogCreateWithoutSessionWindowInput[] | DecisionLogUncheckedCreateWithoutSessionWindowInput[]
    connectOrCreate?: DecisionLogCreateOrConnectWithoutSessionWindowInput | DecisionLogCreateOrConnectWithoutSessionWindowInput[]
    upsert?: DecisionLogUpsertWithWhereUniqueWithoutSessionWindowInput | DecisionLogUpsertWithWhereUniqueWithoutSessionWindowInput[]
    createMany?: DecisionLogCreateManySessionWindowInputEnvelope
    set?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
    disconnect?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
    delete?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
    connect?: DecisionLogWhereUniqueInput | DecisionLogWhereUniqueInput[]
    update?: DecisionLogUpdateWithWhereUniqueWithoutSessionWindowInput | DecisionLogUpdateWithWhereUniqueWithoutSessionWindowInput[]
    updateMany?: DecisionLogUpdateManyWithWhereWithoutSessionWindowInput | DecisionLogUpdateManyWithWhereWithoutSessionWindowInput[]
    deleteMany?: DecisionLogScalarWhereInput | DecisionLogScalarWhereInput[]
  }

  export type SignalCreateNestedOneWithoutDecisionsInput = {
    create?: XOR<SignalCreateWithoutDecisionsInput, SignalUncheckedCreateWithoutDecisionsInput>
    connectOrCreate?: SignalCreateOrConnectWithoutDecisionsInput
    connect?: SignalWhereUniqueInput
  }

  export type SessionWindowCreateNestedOneWithoutDecisionsInput = {
    create?: XOR<SessionWindowCreateWithoutDecisionsInput, SessionWindowUncheckedCreateWithoutDecisionsInput>
    connectOrCreate?: SessionWindowCreateOrConnectWithoutDecisionsInput
    connect?: SessionWindowWhereUniqueInput
  }

  export type PendingOrderCreateNestedOneWithoutDecisionInput = {
    create?: XOR<PendingOrderCreateWithoutDecisionInput, PendingOrderUncheckedCreateWithoutDecisionInput>
    connectOrCreate?: PendingOrderCreateOrConnectWithoutDecisionInput
    connect?: PendingOrderWhereUniqueInput
  }

  export type TradeCreateNestedOneWithoutDecisionsInput = {
    create?: XOR<TradeCreateWithoutDecisionsInput, TradeUncheckedCreateWithoutDecisionsInput>
    connectOrCreate?: TradeCreateOrConnectWithoutDecisionsInput
    connect?: TradeWhereUniqueInput
  }

  export type EnumDecisionActionFieldUpdateOperationsInput = {
    set?: $Enums.DecisionAction
  }

  export type EnumDecisionStatusFieldUpdateOperationsInput = {
    set?: $Enums.DecisionStatus
  }

  export type SignalUpdateOneWithoutDecisionsNestedInput = {
    create?: XOR<SignalCreateWithoutDecisionsInput, SignalUncheckedCreateWithoutDecisionsInput>
    connectOrCreate?: SignalCreateOrConnectWithoutDecisionsInput
    upsert?: SignalUpsertWithoutDecisionsInput
    disconnect?: SignalWhereInput | boolean
    delete?: SignalWhereInput | boolean
    connect?: SignalWhereUniqueInput
    update?: XOR<XOR<SignalUpdateToOneWithWhereWithoutDecisionsInput, SignalUpdateWithoutDecisionsInput>, SignalUncheckedUpdateWithoutDecisionsInput>
  }

  export type SessionWindowUpdateOneWithoutDecisionsNestedInput = {
    create?: XOR<SessionWindowCreateWithoutDecisionsInput, SessionWindowUncheckedCreateWithoutDecisionsInput>
    connectOrCreate?: SessionWindowCreateOrConnectWithoutDecisionsInput
    upsert?: SessionWindowUpsertWithoutDecisionsInput
    disconnect?: SessionWindowWhereInput | boolean
    delete?: SessionWindowWhereInput | boolean
    connect?: SessionWindowWhereUniqueInput
    update?: XOR<XOR<SessionWindowUpdateToOneWithWhereWithoutDecisionsInput, SessionWindowUpdateWithoutDecisionsInput>, SessionWindowUncheckedUpdateWithoutDecisionsInput>
  }

  export type PendingOrderUpdateOneWithoutDecisionNestedInput = {
    create?: XOR<PendingOrderCreateWithoutDecisionInput, PendingOrderUncheckedCreateWithoutDecisionInput>
    connectOrCreate?: PendingOrderCreateOrConnectWithoutDecisionInput
    upsert?: PendingOrderUpsertWithoutDecisionInput
    disconnect?: PendingOrderWhereInput | boolean
    delete?: PendingOrderWhereInput | boolean
    connect?: PendingOrderWhereUniqueInput
    update?: XOR<XOR<PendingOrderUpdateToOneWithWhereWithoutDecisionInput, PendingOrderUpdateWithoutDecisionInput>, PendingOrderUncheckedUpdateWithoutDecisionInput>
  }

  export type TradeUpdateOneWithoutDecisionsNestedInput = {
    create?: XOR<TradeCreateWithoutDecisionsInput, TradeUncheckedCreateWithoutDecisionsInput>
    connectOrCreate?: TradeCreateOrConnectWithoutDecisionsInput
    upsert?: TradeUpsertWithoutDecisionsInput
    disconnect?: TradeWhereInput | boolean
    delete?: TradeWhereInput | boolean
    connect?: TradeWhereUniqueInput
    update?: XOR<XOR<TradeUpdateToOneWithWhereWithoutDecisionsInput, TradeUpdateWithoutDecisionsInput>, TradeUncheckedUpdateWithoutDecisionsInput>
  }

  export type DecisionLogCreateNestedOneWithoutPendingOrderInput = {
    create?: XOR<DecisionLogCreateWithoutPendingOrderInput, DecisionLogUncheckedCreateWithoutPendingOrderInput>
    connectOrCreate?: DecisionLogCreateOrConnectWithoutPendingOrderInput
    connect?: DecisionLogWhereUniqueInput
  }

  export type DecisionLogUncheckedCreateNestedOneWithoutPendingOrderInput = {
    create?: XOR<DecisionLogCreateWithoutPendingOrderInput, DecisionLogUncheckedCreateWithoutPendingOrderInput>
    connectOrCreate?: DecisionLogCreateOrConnectWithoutPendingOrderInput
    connect?: DecisionLogWhereUniqueInput
  }

  export type EnumPendingOrderTypeFieldUpdateOperationsInput = {
    set?: $Enums.PendingOrderType
  }

  export type EnumPendingOrderStatusFieldUpdateOperationsInput = {
    set?: $Enums.PendingOrderStatus
  }

  export type DecisionLogUpdateOneWithoutPendingOrderNestedInput = {
    create?: XOR<DecisionLogCreateWithoutPendingOrderInput, DecisionLogUncheckedCreateWithoutPendingOrderInput>
    connectOrCreate?: DecisionLogCreateOrConnectWithoutPendingOrderInput
    upsert?: DecisionLogUpsertWithoutPendingOrderInput
    disconnect?: DecisionLogWhereInput | boolean
    delete?: DecisionLogWhereInput | boolean
    connect?: DecisionLogWhereUniqueInput
    update?: XOR<XOR<DecisionLogUpdateToOneWithWhereWithoutPendingOrderInput, DecisionLogUpdateWithoutPendingOrderInput>, DecisionLogUncheckedUpdateWithoutPendingOrderInput>
  }

  export type DecisionLogUncheckedUpdateOneWithoutPendingOrderNestedInput = {
    create?: XOR<DecisionLogCreateWithoutPendingOrderInput, DecisionLogUncheckedCreateWithoutPendingOrderInput>
    connectOrCreate?: DecisionLogCreateOrConnectWithoutPendingOrderInput
    upsert?: DecisionLogUpsertWithoutPendingOrderInput
    disconnect?: DecisionLogWhereInput | boolean
    delete?: DecisionLogWhereInput | boolean
    connect?: DecisionLogWhereUniqueInput
    update?: XOR<XOR<DecisionLogUpdateToOneWithWhereWithoutPendingOrderInput, DecisionLogUpdateWithoutPendingOrderInput>, DecisionLogUncheckedUpdateWithoutPendingOrderInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedBigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type NestedEnumTradeSideFilter<$PrismaModel = never> = {
    equals?: $Enums.TradeSide | EnumTradeSideFieldRefInput<$PrismaModel>
    in?: $Enums.TradeSide[] | ListEnumTradeSideFieldRefInput<$PrismaModel>
    notIn?: $Enums.TradeSide[] | ListEnumTradeSideFieldRefInput<$PrismaModel>
    not?: NestedEnumTradeSideFilter<$PrismaModel> | $Enums.TradeSide
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumTradeStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TradeStatus | EnumTradeStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TradeStatus[] | ListEnumTradeStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TradeStatus[] | ListEnumTradeStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTradeStatusFilter<$PrismaModel> | $Enums.TradeStatus
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedBigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type NestedEnumTradeSideWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TradeSide | EnumTradeSideFieldRefInput<$PrismaModel>
    in?: $Enums.TradeSide[] | ListEnumTradeSideFieldRefInput<$PrismaModel>
    notIn?: $Enums.TradeSide[] | ListEnumTradeSideFieldRefInput<$PrismaModel>
    not?: NestedEnumTradeSideWithAggregatesFilter<$PrismaModel> | $Enums.TradeSide
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTradeSideFilter<$PrismaModel>
    _max?: NestedEnumTradeSideFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedEnumTradeStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TradeStatus | EnumTradeStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TradeStatus[] | ListEnumTradeStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TradeStatus[] | ListEnumTradeStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTradeStatusWithAggregatesFilter<$PrismaModel> | $Enums.TradeStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTradeStatusFilter<$PrismaModel>
    _max?: NestedEnumTradeStatusFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumSignalDirectionFilter<$PrismaModel = never> = {
    equals?: $Enums.SignalDirection | EnumSignalDirectionFieldRefInput<$PrismaModel>
    in?: $Enums.SignalDirection[] | ListEnumSignalDirectionFieldRefInput<$PrismaModel>
    notIn?: $Enums.SignalDirection[] | ListEnumSignalDirectionFieldRefInput<$PrismaModel>
    not?: NestedEnumSignalDirectionFilter<$PrismaModel> | $Enums.SignalDirection
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedEnumSignalDirectionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SignalDirection | EnumSignalDirectionFieldRefInput<$PrismaModel>
    in?: $Enums.SignalDirection[] | ListEnumSignalDirectionFieldRefInput<$PrismaModel>
    notIn?: $Enums.SignalDirection[] | ListEnumSignalDirectionFieldRefInput<$PrismaModel>
    not?: NestedEnumSignalDirectionWithAggregatesFilter<$PrismaModel> | $Enums.SignalDirection
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSignalDirectionFilter<$PrismaModel>
    _max?: NestedEnumSignalDirectionFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedEnumLogLevelFilter<$PrismaModel = never> = {
    equals?: $Enums.LogLevel | EnumLogLevelFieldRefInput<$PrismaModel>
    in?: $Enums.LogLevel[] | ListEnumLogLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.LogLevel[] | ListEnumLogLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumLogLevelFilter<$PrismaModel> | $Enums.LogLevel
  }

  export type NestedEnumLogLevelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LogLevel | EnumLogLevelFieldRefInput<$PrismaModel>
    in?: $Enums.LogLevel[] | ListEnumLogLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.LogLevel[] | ListEnumLogLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumLogLevelWithAggregatesFilter<$PrismaModel> | $Enums.LogLevel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumLogLevelFilter<$PrismaModel>
    _max?: NestedEnumLogLevelFilter<$PrismaModel>
  }

  export type NestedEnumNotificationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.NotificationStatus | EnumNotificationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.NotificationStatus[] | ListEnumNotificationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.NotificationStatus[] | ListEnumNotificationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumNotificationStatusFilter<$PrismaModel> | $Enums.NotificationStatus
  }

  export type NestedEnumNotificationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.NotificationStatus | EnumNotificationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.NotificationStatus[] | ListEnumNotificationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.NotificationStatus[] | ListEnumNotificationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumNotificationStatusWithAggregatesFilter<$PrismaModel> | $Enums.NotificationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumNotificationStatusFilter<$PrismaModel>
    _max?: NestedEnumNotificationStatusFilter<$PrismaModel>
  }

  export type NestedEnumBotModeFilter<$PrismaModel = never> = {
    equals?: $Enums.BotMode | EnumBotModeFieldRefInput<$PrismaModel>
    in?: $Enums.BotMode[] | ListEnumBotModeFieldRefInput<$PrismaModel>
    notIn?: $Enums.BotMode[] | ListEnumBotModeFieldRefInput<$PrismaModel>
    not?: NestedEnumBotModeFilter<$PrismaModel> | $Enums.BotMode
  }

  export type NestedEnumBotModeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BotMode | EnumBotModeFieldRefInput<$PrismaModel>
    in?: $Enums.BotMode[] | ListEnumBotModeFieldRefInput<$PrismaModel>
    notIn?: $Enums.BotMode[] | ListEnumBotModeFieldRefInput<$PrismaModel>
    not?: NestedEnumBotModeWithAggregatesFilter<$PrismaModel> | $Enums.BotMode
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBotModeFilter<$PrismaModel>
    _max?: NestedEnumBotModeFilter<$PrismaModel>
  }

  export type NestedEnumDecisionActionFilter<$PrismaModel = never> = {
    equals?: $Enums.DecisionAction | EnumDecisionActionFieldRefInput<$PrismaModel>
    in?: $Enums.DecisionAction[] | ListEnumDecisionActionFieldRefInput<$PrismaModel>
    notIn?: $Enums.DecisionAction[] | ListEnumDecisionActionFieldRefInput<$PrismaModel>
    not?: NestedEnumDecisionActionFilter<$PrismaModel> | $Enums.DecisionAction
  }

  export type NestedEnumDecisionStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.DecisionStatus | EnumDecisionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DecisionStatus[] | ListEnumDecisionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DecisionStatus[] | ListEnumDecisionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDecisionStatusFilter<$PrismaModel> | $Enums.DecisionStatus
  }

  export type NestedEnumDecisionActionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DecisionAction | EnumDecisionActionFieldRefInput<$PrismaModel>
    in?: $Enums.DecisionAction[] | ListEnumDecisionActionFieldRefInput<$PrismaModel>
    notIn?: $Enums.DecisionAction[] | ListEnumDecisionActionFieldRefInput<$PrismaModel>
    not?: NestedEnumDecisionActionWithAggregatesFilter<$PrismaModel> | $Enums.DecisionAction
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDecisionActionFilter<$PrismaModel>
    _max?: NestedEnumDecisionActionFilter<$PrismaModel>
  }

  export type NestedEnumDecisionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DecisionStatus | EnumDecisionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DecisionStatus[] | ListEnumDecisionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DecisionStatus[] | ListEnumDecisionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDecisionStatusWithAggregatesFilter<$PrismaModel> | $Enums.DecisionStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDecisionStatusFilter<$PrismaModel>
    _max?: NestedEnumDecisionStatusFilter<$PrismaModel>
  }

  export type NestedEnumPendingOrderTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.PendingOrderType | EnumPendingOrderTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PendingOrderType[] | ListEnumPendingOrderTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PendingOrderType[] | ListEnumPendingOrderTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPendingOrderTypeFilter<$PrismaModel> | $Enums.PendingOrderType
  }

  export type NestedEnumPendingOrderStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PendingOrderStatus | EnumPendingOrderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PendingOrderStatus[] | ListEnumPendingOrderStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PendingOrderStatus[] | ListEnumPendingOrderStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPendingOrderStatusFilter<$PrismaModel> | $Enums.PendingOrderStatus
  }

  export type NestedEnumPendingOrderTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PendingOrderType | EnumPendingOrderTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PendingOrderType[] | ListEnumPendingOrderTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PendingOrderType[] | ListEnumPendingOrderTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPendingOrderTypeWithAggregatesFilter<$PrismaModel> | $Enums.PendingOrderType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPendingOrderTypeFilter<$PrismaModel>
    _max?: NestedEnumPendingOrderTypeFilter<$PrismaModel>
  }

  export type NestedEnumPendingOrderStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PendingOrderStatus | EnumPendingOrderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PendingOrderStatus[] | ListEnumPendingOrderStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PendingOrderStatus[] | ListEnumPendingOrderStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPendingOrderStatusWithAggregatesFilter<$PrismaModel> | $Enums.PendingOrderStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPendingOrderStatusFilter<$PrismaModel>
    _max?: NestedEnumPendingOrderStatusFilter<$PrismaModel>
  }

  export type DecisionLogCreateWithoutTradeInput = {
    id?: string
    symbol: string
    timeframe?: string | null
    action?: $Enums.DecisionAction
    status?: $Enums.DecisionStatus
    model?: string | null
    inputPrompt: string
    outputDecision: string
    rationale?: string | null
    confidenceScore?: number | null
    proposedSl?: number | null
    proposedTp?: number | null
    proposedVolume?: number | null
    latencyMs?: number | null
    error?: string | null
    createdAt?: Date | string
    signal?: SignalCreateNestedOneWithoutDecisionsInput
    sessionWindow?: SessionWindowCreateNestedOneWithoutDecisionsInput
    pendingOrder?: PendingOrderCreateNestedOneWithoutDecisionInput
  }

  export type DecisionLogUncheckedCreateWithoutTradeInput = {
    id?: string
    symbol: string
    timeframe?: string | null
    action?: $Enums.DecisionAction
    status?: $Enums.DecisionStatus
    model?: string | null
    inputPrompt: string
    outputDecision: string
    rationale?: string | null
    confidenceScore?: number | null
    proposedSl?: number | null
    proposedTp?: number | null
    proposedVolume?: number | null
    latencyMs?: number | null
    error?: string | null
    signalId?: string | null
    sessionWindowId?: string | null
    pendingOrderId?: string | null
    createdAt?: Date | string
  }

  export type DecisionLogCreateOrConnectWithoutTradeInput = {
    where: DecisionLogWhereUniqueInput
    create: XOR<DecisionLogCreateWithoutTradeInput, DecisionLogUncheckedCreateWithoutTradeInput>
  }

  export type DecisionLogCreateManyTradeInputEnvelope = {
    data: DecisionLogCreateManyTradeInput | DecisionLogCreateManyTradeInput[]
    skipDuplicates?: boolean
  }

  export type DecisionLogUpsertWithWhereUniqueWithoutTradeInput = {
    where: DecisionLogWhereUniqueInput
    update: XOR<DecisionLogUpdateWithoutTradeInput, DecisionLogUncheckedUpdateWithoutTradeInput>
    create: XOR<DecisionLogCreateWithoutTradeInput, DecisionLogUncheckedCreateWithoutTradeInput>
  }

  export type DecisionLogUpdateWithWhereUniqueWithoutTradeInput = {
    where: DecisionLogWhereUniqueInput
    data: XOR<DecisionLogUpdateWithoutTradeInput, DecisionLogUncheckedUpdateWithoutTradeInput>
  }

  export type DecisionLogUpdateManyWithWhereWithoutTradeInput = {
    where: DecisionLogScalarWhereInput
    data: XOR<DecisionLogUpdateManyMutationInput, DecisionLogUncheckedUpdateManyWithoutTradeInput>
  }

  export type DecisionLogScalarWhereInput = {
    AND?: DecisionLogScalarWhereInput | DecisionLogScalarWhereInput[]
    OR?: DecisionLogScalarWhereInput[]
    NOT?: DecisionLogScalarWhereInput | DecisionLogScalarWhereInput[]
    id?: StringFilter<"DecisionLog"> | string
    symbol?: StringFilter<"DecisionLog"> | string
    timeframe?: StringNullableFilter<"DecisionLog"> | string | null
    action?: EnumDecisionActionFilter<"DecisionLog"> | $Enums.DecisionAction
    status?: EnumDecisionStatusFilter<"DecisionLog"> | $Enums.DecisionStatus
    model?: StringNullableFilter<"DecisionLog"> | string | null
    inputPrompt?: StringFilter<"DecisionLog"> | string
    outputDecision?: StringFilter<"DecisionLog"> | string
    rationale?: StringNullableFilter<"DecisionLog"> | string | null
    confidenceScore?: FloatNullableFilter<"DecisionLog"> | number | null
    proposedSl?: FloatNullableFilter<"DecisionLog"> | number | null
    proposedTp?: FloatNullableFilter<"DecisionLog"> | number | null
    proposedVolume?: FloatNullableFilter<"DecisionLog"> | number | null
    latencyMs?: IntNullableFilter<"DecisionLog"> | number | null
    error?: StringNullableFilter<"DecisionLog"> | string | null
    signalId?: StringNullableFilter<"DecisionLog"> | string | null
    sessionWindowId?: StringNullableFilter<"DecisionLog"> | string | null
    pendingOrderId?: StringNullableFilter<"DecisionLog"> | string | null
    tradeId?: StringNullableFilter<"DecisionLog"> | string | null
    createdAt?: DateTimeFilter<"DecisionLog"> | Date | string
  }

  export type DecisionLogCreateWithoutSignalInput = {
    id?: string
    symbol: string
    timeframe?: string | null
    action?: $Enums.DecisionAction
    status?: $Enums.DecisionStatus
    model?: string | null
    inputPrompt: string
    outputDecision: string
    rationale?: string | null
    confidenceScore?: number | null
    proposedSl?: number | null
    proposedTp?: number | null
    proposedVolume?: number | null
    latencyMs?: number | null
    error?: string | null
    createdAt?: Date | string
    sessionWindow?: SessionWindowCreateNestedOneWithoutDecisionsInput
    pendingOrder?: PendingOrderCreateNestedOneWithoutDecisionInput
    trade?: TradeCreateNestedOneWithoutDecisionsInput
  }

  export type DecisionLogUncheckedCreateWithoutSignalInput = {
    id?: string
    symbol: string
    timeframe?: string | null
    action?: $Enums.DecisionAction
    status?: $Enums.DecisionStatus
    model?: string | null
    inputPrompt: string
    outputDecision: string
    rationale?: string | null
    confidenceScore?: number | null
    proposedSl?: number | null
    proposedTp?: number | null
    proposedVolume?: number | null
    latencyMs?: number | null
    error?: string | null
    sessionWindowId?: string | null
    pendingOrderId?: string | null
    tradeId?: string | null
    createdAt?: Date | string
  }

  export type DecisionLogCreateOrConnectWithoutSignalInput = {
    where: DecisionLogWhereUniqueInput
    create: XOR<DecisionLogCreateWithoutSignalInput, DecisionLogUncheckedCreateWithoutSignalInput>
  }

  export type DecisionLogCreateManySignalInputEnvelope = {
    data: DecisionLogCreateManySignalInput | DecisionLogCreateManySignalInput[]
    skipDuplicates?: boolean
  }

  export type DecisionLogUpsertWithWhereUniqueWithoutSignalInput = {
    where: DecisionLogWhereUniqueInput
    update: XOR<DecisionLogUpdateWithoutSignalInput, DecisionLogUncheckedUpdateWithoutSignalInput>
    create: XOR<DecisionLogCreateWithoutSignalInput, DecisionLogUncheckedCreateWithoutSignalInput>
  }

  export type DecisionLogUpdateWithWhereUniqueWithoutSignalInput = {
    where: DecisionLogWhereUniqueInput
    data: XOR<DecisionLogUpdateWithoutSignalInput, DecisionLogUncheckedUpdateWithoutSignalInput>
  }

  export type DecisionLogUpdateManyWithWhereWithoutSignalInput = {
    where: DecisionLogScalarWhereInput
    data: XOR<DecisionLogUpdateManyMutationInput, DecisionLogUncheckedUpdateManyWithoutSignalInput>
  }

  export type DecisionLogCreateWithoutSessionWindowInput = {
    id?: string
    symbol: string
    timeframe?: string | null
    action?: $Enums.DecisionAction
    status?: $Enums.DecisionStatus
    model?: string | null
    inputPrompt: string
    outputDecision: string
    rationale?: string | null
    confidenceScore?: number | null
    proposedSl?: number | null
    proposedTp?: number | null
    proposedVolume?: number | null
    latencyMs?: number | null
    error?: string | null
    createdAt?: Date | string
    signal?: SignalCreateNestedOneWithoutDecisionsInput
    pendingOrder?: PendingOrderCreateNestedOneWithoutDecisionInput
    trade?: TradeCreateNestedOneWithoutDecisionsInput
  }

  export type DecisionLogUncheckedCreateWithoutSessionWindowInput = {
    id?: string
    symbol: string
    timeframe?: string | null
    action?: $Enums.DecisionAction
    status?: $Enums.DecisionStatus
    model?: string | null
    inputPrompt: string
    outputDecision: string
    rationale?: string | null
    confidenceScore?: number | null
    proposedSl?: number | null
    proposedTp?: number | null
    proposedVolume?: number | null
    latencyMs?: number | null
    error?: string | null
    signalId?: string | null
    pendingOrderId?: string | null
    tradeId?: string | null
    createdAt?: Date | string
  }

  export type DecisionLogCreateOrConnectWithoutSessionWindowInput = {
    where: DecisionLogWhereUniqueInput
    create: XOR<DecisionLogCreateWithoutSessionWindowInput, DecisionLogUncheckedCreateWithoutSessionWindowInput>
  }

  export type DecisionLogCreateManySessionWindowInputEnvelope = {
    data: DecisionLogCreateManySessionWindowInput | DecisionLogCreateManySessionWindowInput[]
    skipDuplicates?: boolean
  }

  export type DecisionLogUpsertWithWhereUniqueWithoutSessionWindowInput = {
    where: DecisionLogWhereUniqueInput
    update: XOR<DecisionLogUpdateWithoutSessionWindowInput, DecisionLogUncheckedUpdateWithoutSessionWindowInput>
    create: XOR<DecisionLogCreateWithoutSessionWindowInput, DecisionLogUncheckedCreateWithoutSessionWindowInput>
  }

  export type DecisionLogUpdateWithWhereUniqueWithoutSessionWindowInput = {
    where: DecisionLogWhereUniqueInput
    data: XOR<DecisionLogUpdateWithoutSessionWindowInput, DecisionLogUncheckedUpdateWithoutSessionWindowInput>
  }

  export type DecisionLogUpdateManyWithWhereWithoutSessionWindowInput = {
    where: DecisionLogScalarWhereInput
    data: XOR<DecisionLogUpdateManyMutationInput, DecisionLogUncheckedUpdateManyWithoutSessionWindowInput>
  }

  export type SignalCreateWithoutDecisionsInput = {
    id?: string
    symbol: string
    timeframe: string
    direction?: $Enums.SignalDirection
    score: number
    acted?: boolean
    indicators?: NullableJsonNullValueInput | InputJsonValue
    evaluation?: NullableJsonNullValueInput | InputJsonValue
    generatedAt?: Date | string
  }

  export type SignalUncheckedCreateWithoutDecisionsInput = {
    id?: string
    symbol: string
    timeframe: string
    direction?: $Enums.SignalDirection
    score: number
    acted?: boolean
    indicators?: NullableJsonNullValueInput | InputJsonValue
    evaluation?: NullableJsonNullValueInput | InputJsonValue
    generatedAt?: Date | string
  }

  export type SignalCreateOrConnectWithoutDecisionsInput = {
    where: SignalWhereUniqueInput
    create: XOR<SignalCreateWithoutDecisionsInput, SignalUncheckedCreateWithoutDecisionsInput>
  }

  export type SessionWindowCreateWithoutDecisionsInput = {
    id?: string
    sessionName: string
    startMinuteUtc: number
    endMinuteUtc: number
    enabled?: boolean
    tradingEnabled?: boolean
    symbols?: SessionWindowCreatesymbolsInput | string[]
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SessionWindowUncheckedCreateWithoutDecisionsInput = {
    id?: string
    sessionName: string
    startMinuteUtc: number
    endMinuteUtc: number
    enabled?: boolean
    tradingEnabled?: boolean
    symbols?: SessionWindowCreatesymbolsInput | string[]
    note?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SessionWindowCreateOrConnectWithoutDecisionsInput = {
    where: SessionWindowWhereUniqueInput
    create: XOR<SessionWindowCreateWithoutDecisionsInput, SessionWindowUncheckedCreateWithoutDecisionsInput>
  }

  export type PendingOrderCreateWithoutDecisionInput = {
    id?: string
    ticket: bigint | number
    symbol: string
    type: $Enums.PendingOrderType
    status?: $Enums.PendingOrderStatus
    volume: number
    price: number
    stopLoss?: number | null
    takeProfit?: number | null
    magic?: number | null
    strategy?: string | null
    comment?: string | null
    placedAt?: Date | string
    expiresAt?: Date | string | null
    triggeredAt?: Date | string | null
    updatedAt?: Date | string
  }

  export type PendingOrderUncheckedCreateWithoutDecisionInput = {
    id?: string
    ticket: bigint | number
    symbol: string
    type: $Enums.PendingOrderType
    status?: $Enums.PendingOrderStatus
    volume: number
    price: number
    stopLoss?: number | null
    takeProfit?: number | null
    magic?: number | null
    strategy?: string | null
    comment?: string | null
    placedAt?: Date | string
    expiresAt?: Date | string | null
    triggeredAt?: Date | string | null
    updatedAt?: Date | string
  }

  export type PendingOrderCreateOrConnectWithoutDecisionInput = {
    where: PendingOrderWhereUniqueInput
    create: XOR<PendingOrderCreateWithoutDecisionInput, PendingOrderUncheckedCreateWithoutDecisionInput>
  }

  export type TradeCreateWithoutDecisionsInput = {
    id?: string
    ticket: bigint | number
    symbol: string
    side: $Enums.TradeSide
    volume: number
    openPrice: number
    closePrice?: number | null
    stopLoss?: number | null
    takeProfit?: number | null
    commission?: number
    swap?: number
    grossProfit?: number
    netProfit?: number
    pips?: number | null
    strategy?: string | null
    magic?: number | null
    comment?: string | null
    status?: $Enums.TradeStatus
    openedAt: Date | string
    closedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type TradeUncheckedCreateWithoutDecisionsInput = {
    id?: string
    ticket: bigint | number
    symbol: string
    side: $Enums.TradeSide
    volume: number
    openPrice: number
    closePrice?: number | null
    stopLoss?: number | null
    takeProfit?: number | null
    commission?: number
    swap?: number
    grossProfit?: number
    netProfit?: number
    pips?: number | null
    strategy?: string | null
    magic?: number | null
    comment?: string | null
    status?: $Enums.TradeStatus
    openedAt: Date | string
    closedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type TradeCreateOrConnectWithoutDecisionsInput = {
    where: TradeWhereUniqueInput
    create: XOR<TradeCreateWithoutDecisionsInput, TradeUncheckedCreateWithoutDecisionsInput>
  }

  export type SignalUpsertWithoutDecisionsInput = {
    update: XOR<SignalUpdateWithoutDecisionsInput, SignalUncheckedUpdateWithoutDecisionsInput>
    create: XOR<SignalCreateWithoutDecisionsInput, SignalUncheckedCreateWithoutDecisionsInput>
    where?: SignalWhereInput
  }

  export type SignalUpdateToOneWithWhereWithoutDecisionsInput = {
    where?: SignalWhereInput
    data: XOR<SignalUpdateWithoutDecisionsInput, SignalUncheckedUpdateWithoutDecisionsInput>
  }

  export type SignalUpdateWithoutDecisionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    timeframe?: StringFieldUpdateOperationsInput | string
    direction?: EnumSignalDirectionFieldUpdateOperationsInput | $Enums.SignalDirection
    score?: FloatFieldUpdateOperationsInput | number
    acted?: BoolFieldUpdateOperationsInput | boolean
    indicators?: NullableJsonNullValueInput | InputJsonValue
    evaluation?: NullableJsonNullValueInput | InputJsonValue
    generatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignalUncheckedUpdateWithoutDecisionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    timeframe?: StringFieldUpdateOperationsInput | string
    direction?: EnumSignalDirectionFieldUpdateOperationsInput | $Enums.SignalDirection
    score?: FloatFieldUpdateOperationsInput | number
    acted?: BoolFieldUpdateOperationsInput | boolean
    indicators?: NullableJsonNullValueInput | InputJsonValue
    evaluation?: NullableJsonNullValueInput | InputJsonValue
    generatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionWindowUpsertWithoutDecisionsInput = {
    update: XOR<SessionWindowUpdateWithoutDecisionsInput, SessionWindowUncheckedUpdateWithoutDecisionsInput>
    create: XOR<SessionWindowCreateWithoutDecisionsInput, SessionWindowUncheckedCreateWithoutDecisionsInput>
    where?: SessionWindowWhereInput
  }

  export type SessionWindowUpdateToOneWithWhereWithoutDecisionsInput = {
    where?: SessionWindowWhereInput
    data: XOR<SessionWindowUpdateWithoutDecisionsInput, SessionWindowUncheckedUpdateWithoutDecisionsInput>
  }

  export type SessionWindowUpdateWithoutDecisionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionName?: StringFieldUpdateOperationsInput | string
    startMinuteUtc?: IntFieldUpdateOperationsInput | number
    endMinuteUtc?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    tradingEnabled?: BoolFieldUpdateOperationsInput | boolean
    symbols?: SessionWindowUpdatesymbolsInput | string[]
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionWindowUncheckedUpdateWithoutDecisionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionName?: StringFieldUpdateOperationsInput | string
    startMinuteUtc?: IntFieldUpdateOperationsInput | number
    endMinuteUtc?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    tradingEnabled?: BoolFieldUpdateOperationsInput | boolean
    symbols?: SessionWindowUpdatesymbolsInput | string[]
    note?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PendingOrderUpsertWithoutDecisionInput = {
    update: XOR<PendingOrderUpdateWithoutDecisionInput, PendingOrderUncheckedUpdateWithoutDecisionInput>
    create: XOR<PendingOrderCreateWithoutDecisionInput, PendingOrderUncheckedCreateWithoutDecisionInput>
    where?: PendingOrderWhereInput
  }

  export type PendingOrderUpdateToOneWithWhereWithoutDecisionInput = {
    where?: PendingOrderWhereInput
    data: XOR<PendingOrderUpdateWithoutDecisionInput, PendingOrderUncheckedUpdateWithoutDecisionInput>
  }

  export type PendingOrderUpdateWithoutDecisionInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticket?: BigIntFieldUpdateOperationsInput | bigint | number
    symbol?: StringFieldUpdateOperationsInput | string
    type?: EnumPendingOrderTypeFieldUpdateOperationsInput | $Enums.PendingOrderType
    status?: EnumPendingOrderStatusFieldUpdateOperationsInput | $Enums.PendingOrderStatus
    volume?: FloatFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    stopLoss?: NullableFloatFieldUpdateOperationsInput | number | null
    takeProfit?: NullableFloatFieldUpdateOperationsInput | number | null
    magic?: NullableIntFieldUpdateOperationsInput | number | null
    strategy?: NullableStringFieldUpdateOperationsInput | string | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    placedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    triggeredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PendingOrderUncheckedUpdateWithoutDecisionInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticket?: BigIntFieldUpdateOperationsInput | bigint | number
    symbol?: StringFieldUpdateOperationsInput | string
    type?: EnumPendingOrderTypeFieldUpdateOperationsInput | $Enums.PendingOrderType
    status?: EnumPendingOrderStatusFieldUpdateOperationsInput | $Enums.PendingOrderStatus
    volume?: FloatFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    stopLoss?: NullableFloatFieldUpdateOperationsInput | number | null
    takeProfit?: NullableFloatFieldUpdateOperationsInput | number | null
    magic?: NullableIntFieldUpdateOperationsInput | number | null
    strategy?: NullableStringFieldUpdateOperationsInput | string | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    placedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    triggeredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TradeUpsertWithoutDecisionsInput = {
    update: XOR<TradeUpdateWithoutDecisionsInput, TradeUncheckedUpdateWithoutDecisionsInput>
    create: XOR<TradeCreateWithoutDecisionsInput, TradeUncheckedCreateWithoutDecisionsInput>
    where?: TradeWhereInput
  }

  export type TradeUpdateToOneWithWhereWithoutDecisionsInput = {
    where?: TradeWhereInput
    data: XOR<TradeUpdateWithoutDecisionsInput, TradeUncheckedUpdateWithoutDecisionsInput>
  }

  export type TradeUpdateWithoutDecisionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticket?: BigIntFieldUpdateOperationsInput | bigint | number
    symbol?: StringFieldUpdateOperationsInput | string
    side?: EnumTradeSideFieldUpdateOperationsInput | $Enums.TradeSide
    volume?: FloatFieldUpdateOperationsInput | number
    openPrice?: FloatFieldUpdateOperationsInput | number
    closePrice?: NullableFloatFieldUpdateOperationsInput | number | null
    stopLoss?: NullableFloatFieldUpdateOperationsInput | number | null
    takeProfit?: NullableFloatFieldUpdateOperationsInput | number | null
    commission?: FloatFieldUpdateOperationsInput | number
    swap?: FloatFieldUpdateOperationsInput | number
    grossProfit?: FloatFieldUpdateOperationsInput | number
    netProfit?: FloatFieldUpdateOperationsInput | number
    pips?: NullableFloatFieldUpdateOperationsInput | number | null
    strategy?: NullableStringFieldUpdateOperationsInput | string | null
    magic?: NullableIntFieldUpdateOperationsInput | number | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumTradeStatusFieldUpdateOperationsInput | $Enums.TradeStatus
    openedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TradeUncheckedUpdateWithoutDecisionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticket?: BigIntFieldUpdateOperationsInput | bigint | number
    symbol?: StringFieldUpdateOperationsInput | string
    side?: EnumTradeSideFieldUpdateOperationsInput | $Enums.TradeSide
    volume?: FloatFieldUpdateOperationsInput | number
    openPrice?: FloatFieldUpdateOperationsInput | number
    closePrice?: NullableFloatFieldUpdateOperationsInput | number | null
    stopLoss?: NullableFloatFieldUpdateOperationsInput | number | null
    takeProfit?: NullableFloatFieldUpdateOperationsInput | number | null
    commission?: FloatFieldUpdateOperationsInput | number
    swap?: FloatFieldUpdateOperationsInput | number
    grossProfit?: FloatFieldUpdateOperationsInput | number
    netProfit?: FloatFieldUpdateOperationsInput | number
    pips?: NullableFloatFieldUpdateOperationsInput | number | null
    strategy?: NullableStringFieldUpdateOperationsInput | string | null
    magic?: NullableIntFieldUpdateOperationsInput | number | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumTradeStatusFieldUpdateOperationsInput | $Enums.TradeStatus
    openedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DecisionLogCreateWithoutPendingOrderInput = {
    id?: string
    symbol: string
    timeframe?: string | null
    action?: $Enums.DecisionAction
    status?: $Enums.DecisionStatus
    model?: string | null
    inputPrompt: string
    outputDecision: string
    rationale?: string | null
    confidenceScore?: number | null
    proposedSl?: number | null
    proposedTp?: number | null
    proposedVolume?: number | null
    latencyMs?: number | null
    error?: string | null
    createdAt?: Date | string
    signal?: SignalCreateNestedOneWithoutDecisionsInput
    sessionWindow?: SessionWindowCreateNestedOneWithoutDecisionsInput
    trade?: TradeCreateNestedOneWithoutDecisionsInput
  }

  export type DecisionLogUncheckedCreateWithoutPendingOrderInput = {
    id?: string
    symbol: string
    timeframe?: string | null
    action?: $Enums.DecisionAction
    status?: $Enums.DecisionStatus
    model?: string | null
    inputPrompt: string
    outputDecision: string
    rationale?: string | null
    confidenceScore?: number | null
    proposedSl?: number | null
    proposedTp?: number | null
    proposedVolume?: number | null
    latencyMs?: number | null
    error?: string | null
    signalId?: string | null
    sessionWindowId?: string | null
    tradeId?: string | null
    createdAt?: Date | string
  }

  export type DecisionLogCreateOrConnectWithoutPendingOrderInput = {
    where: DecisionLogWhereUniqueInput
    create: XOR<DecisionLogCreateWithoutPendingOrderInput, DecisionLogUncheckedCreateWithoutPendingOrderInput>
  }

  export type DecisionLogUpsertWithoutPendingOrderInput = {
    update: XOR<DecisionLogUpdateWithoutPendingOrderInput, DecisionLogUncheckedUpdateWithoutPendingOrderInput>
    create: XOR<DecisionLogCreateWithoutPendingOrderInput, DecisionLogUncheckedCreateWithoutPendingOrderInput>
    where?: DecisionLogWhereInput
  }

  export type DecisionLogUpdateToOneWithWhereWithoutPendingOrderInput = {
    where?: DecisionLogWhereInput
    data: XOR<DecisionLogUpdateWithoutPendingOrderInput, DecisionLogUncheckedUpdateWithoutPendingOrderInput>
  }

  export type DecisionLogUpdateWithoutPendingOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    action?: EnumDecisionActionFieldUpdateOperationsInput | $Enums.DecisionAction
    status?: EnumDecisionStatusFieldUpdateOperationsInput | $Enums.DecisionStatus
    model?: NullableStringFieldUpdateOperationsInput | string | null
    inputPrompt?: StringFieldUpdateOperationsInput | string
    outputDecision?: StringFieldUpdateOperationsInput | string
    rationale?: NullableStringFieldUpdateOperationsInput | string | null
    confidenceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedSl?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedTp?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedVolume?: NullableFloatFieldUpdateOperationsInput | number | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
    error?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    signal?: SignalUpdateOneWithoutDecisionsNestedInput
    sessionWindow?: SessionWindowUpdateOneWithoutDecisionsNestedInput
    trade?: TradeUpdateOneWithoutDecisionsNestedInput
  }

  export type DecisionLogUncheckedUpdateWithoutPendingOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    action?: EnumDecisionActionFieldUpdateOperationsInput | $Enums.DecisionAction
    status?: EnumDecisionStatusFieldUpdateOperationsInput | $Enums.DecisionStatus
    model?: NullableStringFieldUpdateOperationsInput | string | null
    inputPrompt?: StringFieldUpdateOperationsInput | string
    outputDecision?: StringFieldUpdateOperationsInput | string
    rationale?: NullableStringFieldUpdateOperationsInput | string | null
    confidenceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedSl?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedTp?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedVolume?: NullableFloatFieldUpdateOperationsInput | number | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
    error?: NullableStringFieldUpdateOperationsInput | string | null
    signalId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionWindowId?: NullableStringFieldUpdateOperationsInput | string | null
    tradeId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DecisionLogCreateManyTradeInput = {
    id?: string
    symbol: string
    timeframe?: string | null
    action?: $Enums.DecisionAction
    status?: $Enums.DecisionStatus
    model?: string | null
    inputPrompt: string
    outputDecision: string
    rationale?: string | null
    confidenceScore?: number | null
    proposedSl?: number | null
    proposedTp?: number | null
    proposedVolume?: number | null
    latencyMs?: number | null
    error?: string | null
    signalId?: string | null
    sessionWindowId?: string | null
    pendingOrderId?: string | null
    createdAt?: Date | string
  }

  export type DecisionLogUpdateWithoutTradeInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    action?: EnumDecisionActionFieldUpdateOperationsInput | $Enums.DecisionAction
    status?: EnumDecisionStatusFieldUpdateOperationsInput | $Enums.DecisionStatus
    model?: NullableStringFieldUpdateOperationsInput | string | null
    inputPrompt?: StringFieldUpdateOperationsInput | string
    outputDecision?: StringFieldUpdateOperationsInput | string
    rationale?: NullableStringFieldUpdateOperationsInput | string | null
    confidenceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedSl?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedTp?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedVolume?: NullableFloatFieldUpdateOperationsInput | number | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
    error?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    signal?: SignalUpdateOneWithoutDecisionsNestedInput
    sessionWindow?: SessionWindowUpdateOneWithoutDecisionsNestedInput
    pendingOrder?: PendingOrderUpdateOneWithoutDecisionNestedInput
  }

  export type DecisionLogUncheckedUpdateWithoutTradeInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    action?: EnumDecisionActionFieldUpdateOperationsInput | $Enums.DecisionAction
    status?: EnumDecisionStatusFieldUpdateOperationsInput | $Enums.DecisionStatus
    model?: NullableStringFieldUpdateOperationsInput | string | null
    inputPrompt?: StringFieldUpdateOperationsInput | string
    outputDecision?: StringFieldUpdateOperationsInput | string
    rationale?: NullableStringFieldUpdateOperationsInput | string | null
    confidenceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedSl?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedTp?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedVolume?: NullableFloatFieldUpdateOperationsInput | number | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
    error?: NullableStringFieldUpdateOperationsInput | string | null
    signalId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionWindowId?: NullableStringFieldUpdateOperationsInput | string | null
    pendingOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DecisionLogUncheckedUpdateManyWithoutTradeInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    action?: EnumDecisionActionFieldUpdateOperationsInput | $Enums.DecisionAction
    status?: EnumDecisionStatusFieldUpdateOperationsInput | $Enums.DecisionStatus
    model?: NullableStringFieldUpdateOperationsInput | string | null
    inputPrompt?: StringFieldUpdateOperationsInput | string
    outputDecision?: StringFieldUpdateOperationsInput | string
    rationale?: NullableStringFieldUpdateOperationsInput | string | null
    confidenceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedSl?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedTp?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedVolume?: NullableFloatFieldUpdateOperationsInput | number | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
    error?: NullableStringFieldUpdateOperationsInput | string | null
    signalId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionWindowId?: NullableStringFieldUpdateOperationsInput | string | null
    pendingOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DecisionLogCreateManySignalInput = {
    id?: string
    symbol: string
    timeframe?: string | null
    action?: $Enums.DecisionAction
    status?: $Enums.DecisionStatus
    model?: string | null
    inputPrompt: string
    outputDecision: string
    rationale?: string | null
    confidenceScore?: number | null
    proposedSl?: number | null
    proposedTp?: number | null
    proposedVolume?: number | null
    latencyMs?: number | null
    error?: string | null
    sessionWindowId?: string | null
    pendingOrderId?: string | null
    tradeId?: string | null
    createdAt?: Date | string
  }

  export type DecisionLogUpdateWithoutSignalInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    action?: EnumDecisionActionFieldUpdateOperationsInput | $Enums.DecisionAction
    status?: EnumDecisionStatusFieldUpdateOperationsInput | $Enums.DecisionStatus
    model?: NullableStringFieldUpdateOperationsInput | string | null
    inputPrompt?: StringFieldUpdateOperationsInput | string
    outputDecision?: StringFieldUpdateOperationsInput | string
    rationale?: NullableStringFieldUpdateOperationsInput | string | null
    confidenceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedSl?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedTp?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedVolume?: NullableFloatFieldUpdateOperationsInput | number | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
    error?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessionWindow?: SessionWindowUpdateOneWithoutDecisionsNestedInput
    pendingOrder?: PendingOrderUpdateOneWithoutDecisionNestedInput
    trade?: TradeUpdateOneWithoutDecisionsNestedInput
  }

  export type DecisionLogUncheckedUpdateWithoutSignalInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    action?: EnumDecisionActionFieldUpdateOperationsInput | $Enums.DecisionAction
    status?: EnumDecisionStatusFieldUpdateOperationsInput | $Enums.DecisionStatus
    model?: NullableStringFieldUpdateOperationsInput | string | null
    inputPrompt?: StringFieldUpdateOperationsInput | string
    outputDecision?: StringFieldUpdateOperationsInput | string
    rationale?: NullableStringFieldUpdateOperationsInput | string | null
    confidenceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedSl?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedTp?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedVolume?: NullableFloatFieldUpdateOperationsInput | number | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
    error?: NullableStringFieldUpdateOperationsInput | string | null
    sessionWindowId?: NullableStringFieldUpdateOperationsInput | string | null
    pendingOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    tradeId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DecisionLogUncheckedUpdateManyWithoutSignalInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    action?: EnumDecisionActionFieldUpdateOperationsInput | $Enums.DecisionAction
    status?: EnumDecisionStatusFieldUpdateOperationsInput | $Enums.DecisionStatus
    model?: NullableStringFieldUpdateOperationsInput | string | null
    inputPrompt?: StringFieldUpdateOperationsInput | string
    outputDecision?: StringFieldUpdateOperationsInput | string
    rationale?: NullableStringFieldUpdateOperationsInput | string | null
    confidenceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedSl?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedTp?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedVolume?: NullableFloatFieldUpdateOperationsInput | number | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
    error?: NullableStringFieldUpdateOperationsInput | string | null
    sessionWindowId?: NullableStringFieldUpdateOperationsInput | string | null
    pendingOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    tradeId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DecisionLogCreateManySessionWindowInput = {
    id?: string
    symbol: string
    timeframe?: string | null
    action?: $Enums.DecisionAction
    status?: $Enums.DecisionStatus
    model?: string | null
    inputPrompt: string
    outputDecision: string
    rationale?: string | null
    confidenceScore?: number | null
    proposedSl?: number | null
    proposedTp?: number | null
    proposedVolume?: number | null
    latencyMs?: number | null
    error?: string | null
    signalId?: string | null
    pendingOrderId?: string | null
    tradeId?: string | null
    createdAt?: Date | string
  }

  export type DecisionLogUpdateWithoutSessionWindowInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    action?: EnumDecisionActionFieldUpdateOperationsInput | $Enums.DecisionAction
    status?: EnumDecisionStatusFieldUpdateOperationsInput | $Enums.DecisionStatus
    model?: NullableStringFieldUpdateOperationsInput | string | null
    inputPrompt?: StringFieldUpdateOperationsInput | string
    outputDecision?: StringFieldUpdateOperationsInput | string
    rationale?: NullableStringFieldUpdateOperationsInput | string | null
    confidenceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedSl?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedTp?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedVolume?: NullableFloatFieldUpdateOperationsInput | number | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
    error?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    signal?: SignalUpdateOneWithoutDecisionsNestedInput
    pendingOrder?: PendingOrderUpdateOneWithoutDecisionNestedInput
    trade?: TradeUpdateOneWithoutDecisionsNestedInput
  }

  export type DecisionLogUncheckedUpdateWithoutSessionWindowInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    action?: EnumDecisionActionFieldUpdateOperationsInput | $Enums.DecisionAction
    status?: EnumDecisionStatusFieldUpdateOperationsInput | $Enums.DecisionStatus
    model?: NullableStringFieldUpdateOperationsInput | string | null
    inputPrompt?: StringFieldUpdateOperationsInput | string
    outputDecision?: StringFieldUpdateOperationsInput | string
    rationale?: NullableStringFieldUpdateOperationsInput | string | null
    confidenceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedSl?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedTp?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedVolume?: NullableFloatFieldUpdateOperationsInput | number | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
    error?: NullableStringFieldUpdateOperationsInput | string | null
    signalId?: NullableStringFieldUpdateOperationsInput | string | null
    pendingOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    tradeId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DecisionLogUncheckedUpdateManyWithoutSessionWindowInput = {
    id?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    timeframe?: NullableStringFieldUpdateOperationsInput | string | null
    action?: EnumDecisionActionFieldUpdateOperationsInput | $Enums.DecisionAction
    status?: EnumDecisionStatusFieldUpdateOperationsInput | $Enums.DecisionStatus
    model?: NullableStringFieldUpdateOperationsInput | string | null
    inputPrompt?: StringFieldUpdateOperationsInput | string
    outputDecision?: StringFieldUpdateOperationsInput | string
    rationale?: NullableStringFieldUpdateOperationsInput | string | null
    confidenceScore?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedSl?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedTp?: NullableFloatFieldUpdateOperationsInput | number | null
    proposedVolume?: NullableFloatFieldUpdateOperationsInput | number | null
    latencyMs?: NullableIntFieldUpdateOperationsInput | number | null
    error?: NullableStringFieldUpdateOperationsInput | string | null
    signalId?: NullableStringFieldUpdateOperationsInput | string | null
    pendingOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    tradeId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}