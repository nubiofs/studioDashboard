import {Injectable, Inject} from "@angular/core";
import {Actions, AppStore} from "angular2-redux-util";
import {Map, List} from "immutable";
import {Observable} from "rxjs/Observable";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/finally";
import "rxjs/add/observable/throw";
import {Http} from "@angular/http";
import * as bootbox from "bootbox";
import * as _ from 'lodash';
import {AdnetCustomerModel} from "./AdnetCustomerModel";

export const RECEIVE_ADNET = 'RECEIVE_ADNET';
export const RECEIVE_CUSTOMERS = 'RECEIVE_CUSTOMERS';
export const UPDATE_ADNET_CUSTOMER = 'UPDATE_ADNET_CUSTOMER';

@Injectable()
export class AdnetActions extends Actions {

    constructor(@Inject('OFFLINE_ENV') private offlineEnv,
                private appStore: AppStore,
                private _http: Http) {
        super(appStore);
    }

    public getAdnet() {
        return (dispatch) => {
            const adnetCustomerId = this.appStore.getState().appdb.get('adnetCustomerId');
            const baseUrl = this.appStore.getState().appdb.get('appBaseUrlAdnet');
            const url = `${baseUrl}`;
            // offline not being used
            if (this.offlineEnv) {
                this._http.get('offline/customerRequest.json').subscribe((result)=> {
                    var jData: Object = result.json();
                })
            } else {
                this._http.get(url)
                    .map(result => {
                        var jData: Object = result.json()
                        dispatch(this.receivedAdnet(jData));
                        var adnetCustomers: List<AdnetCustomerModel> = List<AdnetCustomerModel>();
                        for (var adnetCustomer of jData['customers']) {
                            const adnetCustomerModel: AdnetCustomerModel = new AdnetCustomerModel(adnetCustomer);
                            adnetCustomers = adnetCustomers.push(adnetCustomerModel)
                        }
                        dispatch(this.receivedCustomers(adnetCustomers));
                    }).subscribe()
            }
        };
    }

    public saveCustomerInfo(data: Object) {
        return (dispatch) => {
            //todo: save to server
            const adnetCustomerId = this.appStore.getState().appdb.get('adnetCustomerId');
            const payload = {
                Value: data,
                Key: adnetCustomerId
            };
            // const baseUrl = this.appStore.getState().appdb.get('appBaseUrlAdnet');
            // const url = `${baseUrl}`;
            // this._http.get(url)
            //     .map(result => {
            //         var jData: Object = result.json()
            //         dispatch(this.receivedAdnet(jData));
            //         var adnetCustomers: List<AdnetCustomerModel> = List<AdnetCustomerModel>();
            //         for (var adnetCustomer of jData['customers']) {
            //             const adnetCustomerModel: AdnetCustomerModel = new AdnetCustomerModel(adnetCustomer);
            //             adnetCustomers = adnetCustomers.push(adnetCustomerModel)
            //         }
            //         dispatch(this.receivedCustomers(adnetCustomers));
            //     }).subscribe()
            dispatch(this.updateAdnetCustomerInfo(payload))
        };
    }

    public receivedAdnet(payload: any) {
        return {
            type: RECEIVE_ADNET,
            payload
        }
    }

    public updateAdnetCustomerInfo(payload) {
        return {
            type: UPDATE_ADNET_CUSTOMER,
            payload
        }
    }

    public receivedCustomers(customers: List<AdnetCustomerModel>) {
        return {
            type: RECEIVE_CUSTOMERS,
            customers
        }
    }
}