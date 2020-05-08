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
	"log"

	"github.com/datachainlab/cross-chain-hackathon/backend/apiserver/rdb"
)

// UserApiService is a service that implents the logic for the UserApiServicer
// This service should implement the business logic for every endpoint for the UserApi API.
// Include any external packages or services that will be required by this service.
type UserApiService struct {
}

// NewUserApiService creates a default api service
func NewUserApiService() UserApiServicer {
	return &UserApiService{}
}

// GetUser - get user information
func (s *UserApiService) GetUser(id string) (interface{}, error) {
	db, err := rdb.InitDB()
	if err != nil {
		log.Println(err)
		return nil, ErrorFailedDBConnect
	}

	log.Printf("id: %s\n", id)
	user := &User{}
	if err := db.Get(user, "SELECT * FROM user WHERE id = ?", id); err != nil {
		log.Println(err)
		return nil, ErrorFailedDBGet
	}
	return user, nil
}
