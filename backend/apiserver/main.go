/*
 * cross-chain-hackathon api
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * API version: 1.0.0
 * Generated by: OpenAPI Generator (https://openapi-generator.tech)
 */

package main

import (
	"log"
	"net/http"

	api "github.com/datachainlab/cross-chain-hackathon/backend/api-server/api"
)

func main() {
	log.Printf("Server started")

	DividendApiService := api.NewDividendApiService()
	DividendApiController := api.NewDividendApiController(DividendApiService)

	EstateApiService := api.NewEstateApiService()
	EstateApiController := api.NewEstateApiController(EstateApiService)

	TradeApiService := api.NewTradeApiService()
	TradeApiController := api.NewTradeApiController(TradeApiService)

	TxApiService := api.NewTxApiService()
	TxApiController := api.NewTxApiController(TxApiService)

	UserApiService := api.NewUserApiService()
	UserApiController := api.NewUserApiController(UserApiService)

	router := api.NewRouter(DividendApiController, EstateApiController, TradeApiController, TxApiController, UserApiController)

	log.Fatal(http.ListenAndServe(":8080", router))
}