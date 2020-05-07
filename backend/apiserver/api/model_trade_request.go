/*
 * cross-chain-hackathon api
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * API version: 1.0.0
 * Generated by: OpenAPI Generator (https://openapi-generator.tech)
 */

package api

import (
	"time"
)

type TradeRequest struct {

	// generated by the API server
	Id int64 `json:"id"`

	// generated by the API server
	TradeId int64 `json:"tradeId"`

	From string `json:"from"`

	CrossTx CrossTx `json:"crossTx"`

	Canceled bool `json:"canceled"`

	UpdatedAt time.Time `json:"updatedAt"`
}