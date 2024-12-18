import { ProductItemCart } from './../interfaces/product.interface';
import { inject, Injectable, Signal } from "@angular/core";
import { signalSlice } from "ngxtension/signal-slice";
import { StorageService } from "./storage.service";
import { map, Observable } from "rxjs";

interface State {
  products: ProductItemCart[];
  loaded: boolean;
}

@Injectable({
  providedIn: 'root'
})

export class CartStateService {
  private _storageService = inject(StorageService)

  private initialState: State = {
    products: [],
    loaded: false
  };

  loadProducts$ = this._storageService.loadProducts().pipe(
    map((products) => ({ products, loaded: true })),
  )

  state = signalSlice({
    initialState: this.initialState,
    sources: [this.loadProducts$],
    actionSources: {
      add: (state, action$: Observable<ProductItemCart>) =>
        action$.pipe(
          map((product) => this.add(state, product
          )),
        ),
    },

    effects: (state) => ({
      load: () => {
        console.log(state.products())
        if(state().loaded) {
          this._storageService.saveProducts(state.products());
        }
      }
    })
  });

  private add(state: Signal<State>, product: ProductItemCart) {
    const isInCart = state().products.find(
      (productInCart) => productInCart.product.id === product.product.id,
    );
    if (!isInCart) {
      return {products: [...state().products, { ...product, quantity: 1 }]}
    }

    isInCart.quantity += 1;
    return {products: [...state().products]}


    // return state().products.map((productInCart) => {
    //   if(productInCart.product.id === product.product.id) {
    //     return {...productInCart, quantity: productInCart.quantity + 1};
    //   }
    //   return productInCart
    // });
  }
}
