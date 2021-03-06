/*
 * cross-chain-hackathon api
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * API version: 1.0.0
 * Generated by: OpenAPI Generator (https://openapi-generator.tech)
 */

package api

// MsgInitiate - a message type defined by cross
type MsgInitiate struct {

	Sender string `json:"Sender"`

	ChainID string `json:"ChainID"`

	ContractTransactions []ContractTransaction `json:"ContractTransactions"`

	TimeoutHeight string `json:"TimeoutHeight"`

	Nonce string `json:"Nonce"`
}
