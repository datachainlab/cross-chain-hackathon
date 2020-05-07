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
	"errors"
)

// EstateApiService is a service that implents the logic for the EstateApiServicer
// This service should implement the business logic for every endpoint for the EstateApi API. 
// Include any external packages or services that will be required by this service.
type EstateApiService struct {
}

// NewEstateApiService creates a default api service
func NewEstateApiService() EstateApiServicer {
	return &EstateApiService{}
}

// GetEstateById - get an estate and its trade data
func (s *EstateApiService) GetEstateById(estateId string) (interface{}, error) {
	// TODO - update GetEstateById with the required logic for this service method.
	// Add api_estate_service.go to the .openapi-generator-ignore to avoid overwriting this service implementation when updating open api generation.
	return nil, errors.New("service method 'GetEstateById' not implemented")
}

// GetEstates - get all estates
func (s *EstateApiService) GetEstates() (interface{}, error) {
	// TODO - update GetEstates with the required logic for this service method.
	// Add api_estate_service.go to the .openapi-generator-ignore to avoid overwriting this service implementation when updating open api generation.
	return nil, errors.New("service method 'GetEstates' not implemented")
}