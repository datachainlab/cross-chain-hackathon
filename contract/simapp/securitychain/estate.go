package securitychain

import (
	"fmt"

	"github.com/datachainlab/cross-chain-hackathon/contract/simapp/common"
	"github.com/datachainlab/cross-chain-hackathon/contract/simapp/safemath"

	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/datachainlab/cross/x/ibc/contract"
	"github.com/datachainlab/cross/x/ibc/cross"
	"github.com/datachainlab/cross/x/ibc/store/lock"
)

const (
	EstateTokenContractID = "estate"

	MaxTokenOwner = 3

	FnNameBalanceOf   = "balanceOf"
	FnNameCreate      = "create"
	FnNameCreatorOf   = "creatorOf"
	FnNameMint        = "mint"
	FnNameTransfer    = "transfer"
	FnNameTotalSupply = "totalSupply"
	//FnNameBalanceOfBatch  = "balanceOfBatch"

	FnNameAddToWhitelist = "addToWhitelist"
	FnNameIsWhitelisted  = "isWhitelisted"
	// FnNameRemoveFromWhitelist  = "removeFromWhitelist"

	FnNameRegisterDividend   = "registerDividend"
	FnNamePayDividend        = "payDividend"
	FnNameDividendIndexOf    = "dividendIndexOf"
	FnNameDividendOf         = "dividendOf"
	FnNameDividendPerShareOf = "dividendPerShareOf"
	FnNameIsDividendPaid     = "isDividendPaid"

	EventNameTransfer           = "Transfer"
	EventNameDividendRegistered = "DividendRegistered"
	EventNameDividendPaid       = "DividendPaid"
)

func EstateTokenContractHandler(k contract.Keeper) cross.ContractHandler {
	contractHandler := contract.NewContractHandler(k, func(store sdk.KVStore) cross.State {
		return lock.NewStore(store)
	})

	contractHandler.AddRoute(EstateTokenContractID, GetEstateTokenContract())
	return contractHandler
}

func GetEstateTokenContract() contract.Contract {
	return contract.NewContract([]contract.Method{
		{
			Name: FnNameBalanceOf, F: balanceOf,
		},
		{
			Name: FnNameCreate, F: create,
		},
		{
			Name: FnNameCreatorOf, F: creatorOf,
		},
		{
			Name: FnNameMint, F: mint,
		},
		{
			Name: FnNameTotalSupply, F: totalSupply,
		},
		{
			Name: FnNameTransfer, F: transfer,
		},
		// Whitelist
		{
			Name: FnNameAddToWhitelist, F: addToWhitelist,
		},
		{
			Name: FnNameIsWhitelisted, F: isWhitelisted,
		},
		// Dividend
		{
			Name: FnNameRegisterDividend, F: registerDividend,
		},
		{
			Name: FnNamePayDividend, F: payDividend,
		},
		{
			Name: FnNameDividendIndexOf, F: dividendIndexOf,
		},
		{
			Name: FnNameDividendOf, F: dividendOf,
		},
		{
			Name: FnNameDividendPerShareOf, F: dividendPerShareOf,
		},
		{
			Name: FnNameIsDividendPaid, F: isDividendPaid,
		},
	})
}

// XXX args order is same as ERC-1155
// function balanceOf(address _owner, uint256 _id) external view returns (uint256) {
func balanceOf(ctx contract.Context, store cross.Store) ([]byte, error) {
	args := ctx.Args()
	if err := common.VerifyArgsLength(args, 2); err != nil {
		return nil, err
	}
	addr, err := common.GetAccAddress(args[0])
	if err != nil {
		return nil, err
	}
	tokenID := contract.UInt64(args[1])
	return contract.ToBytes(getAmount(addr, tokenID, store)), nil
}

// TODO we won't use token URI
//	function create(uint256 _initialSupply, string calldata _uri) external returns(uint256 _id) {
func create(ctx contract.Context, store cross.Store) ([]byte, error) {
	creator := ctx.Signers()[0]
	args := ctx.Args()
	if err := common.VerifyArgsLength(args, 2); err != nil {
		return nil, err
	}
	tokenID := getTokenID(store)
	var ok bool
	if tokenID, ok = safemath.Add64(tokenID, 1); ok {
		setTokenID(tokenID, store)
	} else {
		return nil, ErrorAddition
	}
	tokenIDB := contract.ToBytes(tokenID)
	setCreator(creator, tokenID, store)
	supply := contract.UInt64(args[0])
	setTotalSupply(supply, tokenID, store)
	setAmount(creator, tokenID, supply, store)
	setOwnerCount(1, tokenID, store)
	emitTransfer(ctx, []byte{}, creator, tokenID, supply)
	return tokenIDB, nil
}

//	function creatorOf(uint256 _id) external returns(address _creator) {
func creatorOf(ctx contract.Context, store cross.Store) ([]byte, error) {
	args := ctx.Args()
	if err := common.VerifyArgsLength(args, 1); err != nil {
		return nil, err
	}
	tokenID := contract.UInt64(args[0])
	key := makeCreatorKey(tokenID)
	if store.Has(key) {
		return store.Get(key), nil
	}
	return nil, ErrorInvalidArg
}

// function mint(uint256 _id, address account, uint256 amount) public returns (bool success) {
func mint(ctx contract.Context, store cross.Store) ([]byte, error) {
	args := ctx.Args()
	if err := common.VerifyArgsLength(args, 3); err != nil {
		return nil, err
	}

	tokenID := contract.UInt64(args[0])
	if !isCreator(ctx.Signers()[0], tokenID, store) {
		return nil, ErrorInvalidSender
	}

	to, err := common.GetAccAddress(args[1])
	if err != nil {
		return nil, err
	}
	value := contract.UInt64(args[2])

	ownerCount := getOwnerCount(tokenID, store)
	toAmount := getAmount(to, tokenID, store)
	if toAmount == 0 && value != 0 {
		setOwnerCount(ownerCount+1, tokenID, store)
	}
	if toAmount, ok := safemath.Add64(toAmount, value); ok {
		setAmount(to, tokenID, toAmount, store)
	} else {
		return nil, ErrorAddition
	}
	if totalSupply, ok := safemath.Add64(getTotalSupply(tokenID, store), value); ok {
		setTotalSupply(totalSupply, tokenID, store)
	} else {
		return nil, ErrorAddition
	}

	if err := check([]byte{}, to, tokenID, store); err != nil {
		return nil, err
	}

	dividendIndex := getDividendIndex(tokenID, store)
	if dividendIndex != 0 && !getDividendPaid(tokenID, dividendIndex, store) {
		setDividendDelta(to, tokenID, dividendIndex, (int64)(-value), store)
	}

	emitTransfer(ctx, []byte{}, to, tokenID, value)
	return contract.ToBytes(true), nil
}

// function totalSupply(uint256 _id) external returns(uint256 _value)
func totalSupply(ctx contract.Context, store cross.Store) ([]byte, error) {
	args := ctx.Args()
	if err := common.VerifyArgsLength(args, 1); err != nil {
		return nil, err
	}
	tokenID := contract.UInt64(args[0])
	key := makeTotalSupplyKey(tokenID)
	if store.Has(key) {
		return store.Get(key), nil
	}
	return nil, ErrorInvalidArg
}

// function transfer(uint256 _id, address _to, uint256 _value) public returns (bool success)
func transfer(ctx contract.Context, store cross.Store) ([]byte, error) {
	args := ctx.Args()
	if err := common.VerifyArgsLength(args, 3); err != nil {
		return nil, err
	}
	tokenID := contract.UInt64(args[0])
	to, err := common.GetAccAddress(args[1])
	if err != nil {
		return nil, err
	}
	from := ctx.Signers()[0]
	value := contract.UInt64(args[2])

	ownerCount := getOwnerCount(tokenID, store)
	if fromAmount, ok := safemath.Sub64(getAmount(from, tokenID, store), value); ok {
		setAmount(from, tokenID, fromAmount, store)
		if fromAmount == 0 && value != 0 {
			ownerCount--
		}
	} else {
		return nil, ErrorInsufficientAmount
	}
	toAmount := getAmount(to, tokenID, store)
	if toAmount == 0 && value != 0 {
		ownerCount++
	}
	if toAmount, ok := safemath.Add64(toAmount, value); ok {
		setAmount(to, tokenID, toAmount, store)
	} else {
		return nil, ErrorAddition
	}
	setOwnerCount(ownerCount, tokenID, store)

	if err := check(from, to, tokenID, store); err != nil {
		return nil, err
	}

	dividendIndex := getDividendIndex(tokenID, store)
	if dividendIndex != 0 && !getDividendPaid(tokenID, dividendIndex, store) {
		setDividendDelta(from, tokenID, dividendIndex, (int64)(value), store)
		setDividendDelta(to, tokenID, dividendIndex, (int64)(-value), store)
	}

	emitTransfer(ctx, from, to, tokenID, value)
	return contract.ToBytes(true), nil
}

// check logics for restricted transfer.
func check(from, to sdk.AccAddress, tokenID uint64, store cross.Store) error {
	creator := getCreator(tokenID, store)
	if creator == nil {
		return ErrorInvalidArg
	}

	if !getWhitelisted(to, creator, store) {
		return ErrorNotWhitelisted
	}
	ownerCount := getOwnerCount(tokenID, store)
	if ownerCount > MaxTokenOwner {
		return ErrorRestrictedTransfer
	}
	return nil
}

func emitTransfer(ctx contract.Context, from, to sdk.AccAddress, tokenID, value uint64) {
	ctx.EventManager().EmitEvent(
		sdk.NewEvent(EventNameTransfer,
			sdk.NewAttribute("from", from.String()),
			sdk.NewAttribute("to", to.String()),
			sdk.NewAttribute("tokenID", common.GetUInt64String(tokenID)),
			sdk.NewAttribute("value", common.GetUInt64String(value)),
		))
}

func getAmount(addr sdk.AccAddress, tokenID uint64, store cross.Store) uint64 {
	key := makeAccountKey(addr, tokenID)
	return common.GetUInt64(key, store)
}

func isCreator(addr sdk.AccAddress, tokenID uint64, store cross.Store) bool {
	creator := getCreator(tokenID, store)
	return creator != nil && creator.Equals(addr)
}

func getCreator(tokenID uint64, store cross.Store) sdk.AccAddress {
	key := makeCreatorKey(tokenID)
	if store.Has(key) {
		return store.Get(key)
	}
	return nil
}

func getOwnerCount(tokenID uint64, store cross.Store) uint64 {
	key := makeTokenOwnerCountKey(tokenID)
	return common.GetUInt64(key, store)
}

func getTokenID(store cross.Store) uint64 {
	key := makeLastTokenIDKey()
	return common.GetUInt64(key, store)
}

func getTotalSupply(tokenID uint64, store cross.Store) uint64 {
	key := makeTotalSupplyKey(tokenID)
	return common.GetUInt64(key, store)
}

func setAmount(addr sdk.AccAddress, tokenID, amount uint64, store cross.Store) uint64 {
	key := makeAccountKey(addr, tokenID)
	store.Set(key, contract.ToBytes(amount))
	return 0
}

func setCreator(creator sdk.AccAddress, tokenID uint64, store cross.Store) uint64 {
	key := makeCreatorKey(tokenID)
	store.Set(key, creator)
	return 0
}

func setOwnerCount(count, tokenID uint64, store cross.Store) uint64 {
	key := makeTokenOwnerCountKey(tokenID)
	store.Set(key, contract.ToBytes(count))
	return 0
}

func setTokenID(id uint64, store cross.Store) uint64 {
	key := makeLastTokenIDKey()
	store.Set(key, contract.ToBytes(id))
	return 0
}

func setTotalSupply(total, tokenID uint64, store cross.Store) uint64 {
	key := makeTotalSupplyKey(tokenID)
	store.Set(key, contract.ToBytes(total))
	return 0
}

func makeAccountKey(addr sdk.AccAddress, tokenID uint64) []byte {
	return []byte(fmt.Sprintf("account/%s/token/%d", addr.String(), tokenID))
}

func makeCreatorKey(tokenID uint64) []byte {
	return []byte(fmt.Sprintf("creator/%d", tokenID))
}

func makeLastTokenIDKey() []byte {
	return []byte("tokenid")
}

func makeTotalSupplyKey(tokenID uint64) []byte {
	return []byte(fmt.Sprintf("totalSupply/%d", tokenID))
}

func makeTokenOwnerCountKey(tokenID uint64) []byte {
	return []byte(fmt.Sprintf("ownerCount/%d", tokenID))
}
