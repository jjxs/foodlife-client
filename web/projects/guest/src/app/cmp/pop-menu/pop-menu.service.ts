import { Injectable } from "ngx-onsenui";
import { Subject } from "rxjs";


@Injectable({
    providedIn: 'root'
})
export class PopMenuService {

    /* ※※※※※※※※※※※※※ Login ※※※※※※※※※※※※※*/
    private popSource = new Subject<Object>()
    popSource$ = this.popSource.asObservable();
    pop(data) {
        this.popSource.next(data);
    }

}