export const notesLoaders = {
    pop1_any_nmg: () => import("./pop1/any_nmg.js").then((m) => m.default),
    pop2_any: () => import("./pop2/any.js").then((m) => m.default),
    pop2_any_v2: () => import("./pop2/any_v2.js").then((m) => m.default),
    pop2_any_v3: () => import("./pop2/any_v3.js").then((m) => m.default),
    pop_sot_gba_any: () => import("./pop_sot_gba/any.js").then((m) => m.default),
    pop_sot_any_zipless: () => import("./pop_sot/any_zipless.js").then((m) => m.default),
    pop_sot_any_nmg: () => import("./pop_sot/any_nmg.js").then((m) => m.default),
    pop_ww_any_zipless: () => import("./pop_ww/any_zipless.js").then((m) => m.default),
    pop_tfk_any: () => import("./pop_tfk/any.js").then((m) => m.default),
    raftwars_any: () => import("./raftwars/any.js").then((m) => m.default),
    stick_with_it_any: () => import("./stick_with_it/any.js").then((m) => m.default),
};

export default notesLoaders;