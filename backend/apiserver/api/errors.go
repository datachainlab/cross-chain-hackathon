package api

import (
	"errors"
	"net/http"
)

const (
	errMsgFailedDBConnect = "failed to connect db"
	errMsgFailedDBGet     = "failed to get db data"
	errMsgFailedDBSet     = "failed to set db data"
)

var (
	ErrorFailedDBConnect = errors.New(errMsgFailedDBConnect)
	ErrorFailedDBGet     = errors.New(errMsgFailedDBGet)
	ErrorFailedDBSet     = errors.New(errMsgFailedDBSet)
)

func HttpStatus(err error) int {
	if errors.Is(err, ErrorFailedDBSet) {
		return http.StatusBadRequest
	} else if errors.Is(err, ErrorFailedDBGet) {
		return http.StatusNotFound
	} else if errors.Is(err, ErrorFailedDBConnect) {
		return http.StatusServiceUnavailable
	} else {
		return http.StatusInternalServerError
	}
}
