/*
 * cross-chain-hackathon api
 *
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * API version: 1.0.0
 * Generated by: OpenAPI Generator (https://openapi-generator.tech)
 */

package api

type Estate struct {

	TokenId string `json:"tokenId"`

	Name string `json:"name"`

	ImagePath string `json:"imagePath"`

	Description string `json:"description"`

	// public offering price
	OfferPrice int64 `json:"offerPrice"`

	// expected yield amount per share
	ExpectedYield int64 `json:"expectedYield"`

	// next dividend date
	DividendDate string `json:"dividendDate"`

	IssuedBy string `json:"issuedBy"`
}
