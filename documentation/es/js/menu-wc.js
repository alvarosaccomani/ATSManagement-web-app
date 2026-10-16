'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">atsmanagement-web-app documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search">
    <input type="text" placeholder="Escribe para buscar">
    <button type="button"
        class="search-input-clear"
        aria-label="Clear search"
        data-search-input-clear>&times;</button>
</div>
` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Comenzando</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="overview.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Descripción general
                                    </a>
                                </li>

                            <li class="link">
                                <a href="index.html" data-type="chapter-link">
                                    <span class="icon ion-ios-paper"></span>
                                        Léeme
                                </a>
                            </li>
                        <li class="link">
                            <a href="license.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>LICENSE
                            </a>
                        </li>
                                <li class="link">
                                    <a href="architecture.html" data-type="chapter-link">
                                        <span class="icon ion-ios-git-branch"></span>Arquitectura
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencias
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Propiedades
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter additional">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#additional-pages"'
                            : 'data-bs-target="#xs-additional-pages"' }>
                            <span class="icon ion-ios-book"></span>
                            <span>Manuales de Uso</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="additional-pages"' : 'id="xs-additional-pages"' }>
                                    <li class="link ">
                                        <a href="additional-documentation/autenticación-y-acceso-sso.html" data-type="entity-link" data-context-id="additional">Autenticación y Acceso SSO</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/dashboard,-caja,-ámbitos-y-comisiones.html" data-type="entity-link" data-context-id="additional">Dashboard, Caja, Ámbitos y Comisiones</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/digitalización,-cámara,-ocr-e-ia.html" data-type="entity-link" data-context-id="additional">Digitalización, Cámara, OCR e IA</a>
                                    </li>
                                    <li class="link ">
                                        <a href="additional-documentation/tarjetas,-vouchers,-cuotas-y-parámetros.html" data-type="entity-link" data-context-id="additional">Tarjetas, Vouchers, Cuotas y Parámetros</a>
                                    </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Componentes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/AccountConfirmedComponent.html" data-type="entity-link" >AccountConfirmedComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AccountCreatedComponent.html" data-type="entity-link" >AccountCreatedComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AppComponent.html" data-type="entity-link" >AppComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AuthLayoutComponent.html" data-type="entity-link" >AuthLayoutComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BankComponent.html" data-type="entity-link" >BankComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BanksComponent.html" data-type="entity-link" >BanksComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BrandCardComponent.html" data-type="entity-link" >BrandCardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BrandCardsComponent.html" data-type="entity-link" >BrandCardsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CameraComponent.html" data-type="entity-link" >CameraComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CardComponent.html" data-type="entity-link" >CardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CardsComponent.html" data-type="entity-link" >CardsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DashboardComponent.html" data-type="entity-link" >DashboardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DocumentsComponent.html" data-type="entity-link" >DocumentsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FileDetailComponent.html" data-type="entity-link" >FileDetailComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ForgotPasswordComponent.html" data-type="entity-link" >ForgotPasswordComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/IframeViewerComponent.html" data-type="entity-link" >IframeViewerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ImageEditorComponent.html" data-type="entity-link" >ImageEditorComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoginComponent.html" data-type="entity-link" >LoginComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/NavBarComponent.html" data-type="entity-link" >NavBarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PaymentMethodComponent.html" data-type="entity-link" >PaymentMethodComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PaymentMethodsComponent.html" data-type="entity-link" >PaymentMethodsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PaymentPeriodComponent.html" data-type="entity-link" >PaymentPeriodComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PaymentPeriodsComponent.html" data-type="entity-link" >PaymentPeriodsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PaymentPeriodsStatusComponent.html" data-type="entity-link" >PaymentPeriodsStatusComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PaymentPeriodStatusComponent.html" data-type="entity-link" >PaymentPeriodStatusComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PdfViewerComponent.html" data-type="entity-link" >PdfViewerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PeriodComponent.html" data-type="entity-link" >PeriodComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PeriodsComponent.html" data-type="entity-link" >PeriodsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PersonComponent.html" data-type="entity-link" >PersonComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PersonsListComponent.html" data-type="entity-link" >PersonsListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RegisterComponent.html" data-type="entity-link" >RegisterComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ResetPasswordComponent.html" data-type="entity-link" >ResetPasswordComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ScopeComponent.html" data-type="entity-link" >ScopeComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ScopesListComponent.html" data-type="entity-link" >ScopesListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SellerCommissionsComponent.html" data-type="entity-link" >SellerCommissionsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SsoCallbackComponent.html" data-type="entity-link" >SsoCallbackComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/StatusPeriodComponent.html" data-type="entity-link" >StatusPeriodComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/StatusPeriodsComponent.html" data-type="entity-link" >StatusPeriodsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TransactionComponent.html" data-type="entity-link" >TransactionComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TransactionsListComponent.html" data-type="entity-link" >TransactionsListComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TreeViewComponent.html" data-type="entity-link" >TreeViewComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TypeCardComponent.html" data-type="entity-link" >TypeCardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TypeCardsComponent.html" data-type="entity-link" >TypeCardsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TypeOperationComponent.html" data-type="entity-link" >TypeOperationComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TypeOperationsComponent.html" data-type="entity-link" >TypeOperationsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UserLayoutComponent.html" data-type="entity-link" >UserLayoutComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VoucherComponent.html" data-type="entity-link" >VoucherComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VoucherFeeComponent.html" data-type="entity-link" >VoucherFeeComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VoucherFeeStatusComponent.html" data-type="entity-link" >VoucherFeeStatusComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VouchersComponent.html" data-type="entity-link" >VouchersComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VouchersFeesComponent.html" data-type="entity-link" >VouchersFeesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VouchersFeeStatusComponent.html" data-type="entity-link" >VouchersFeeStatusComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VouchersStatesComponent.html" data-type="entity-link" >VouchersStatesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VoucherStateComponent.html" data-type="entity-link" >VoucherStateComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Inyectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AiService.html" data-type="entity-link" >AiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BanksService.html" data-type="entity-link" >BanksService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BrandCardsService.html" data-type="entity-link" >BrandCardsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CardsService.html" data-type="entity-link" >CardsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CommissionsService.html" data-type="entity-link" >CommissionsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DashboardService.html" data-type="entity-link" >DashboardService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MessageService.html" data-type="entity-link" >MessageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OcrService.html" data-type="entity-link" >OcrService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PaymentMethodsService.html" data-type="entity-link" >PaymentMethodsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PaymentPeriodsService.html" data-type="entity-link" >PaymentPeriodsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PaymentPeriodsStatusService.html" data-type="entity-link" >PaymentPeriodsStatusService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PendingVouchersService.html" data-type="entity-link" >PendingVouchersService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PeriodsService.html" data-type="entity-link" >PeriodsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PersonsService.html" data-type="entity-link" >PersonsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ScopesService.html" data-type="entity-link" >ScopesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SessionService.html" data-type="entity-link" >SessionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StatusPeriodsService.html" data-type="entity-link" >StatusPeriodsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TransactionsService.html" data-type="entity-link" >TransactionsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TreesService.html" data-type="entity-link" >TreesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TypeCardsService.html" data-type="entity-link" >TypeCardsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TypeOperationsService.html" data-type="entity-link" >TypeOperationsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UsersService.html" data-type="entity-link" >UsersService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/VouchersFeesService.html" data-type="entity-link" >VouchersFeesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/VouchersFeeStatusService.html" data-type="entity-link" >VouchersFeeStatusService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/VouchersParserService.html" data-type="entity-link" >VouchersParserService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/VouchersService.html" data-type="entity-link" >VouchersService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/VouchersStatesService.html" data-type="entity-link" >VouchersStatesService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guardias</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/authGuard.html" data-type="entity-link" >authGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/unauthGuard.html" data-type="entity-link" >unauthGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/AIChatInterface.html" data-type="entity-link" >AIChatInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BankInterface.html" data-type="entity-link" >BankInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BankResults.html" data-type="entity-link" >BankResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BrandCardInterface.html" data-type="entity-link" >BrandCardInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BrandCardResults.html" data-type="entity-link" >BrandCardResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CardInterface.html" data-type="entity-link" >CardInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CardResults.html" data-type="entity-link" >CardResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DashboardResults.html" data-type="entity-link" >DashboardResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DashboardSummary.html" data-type="entity-link" >DashboardSummary</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MessageConfig.html" data-type="entity-link" >MessageConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PageWithWords.html" data-type="entity-link" >PageWithWords</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaymentMethodInterface.html" data-type="entity-link" >PaymentMethodInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaymentMethodResults.html" data-type="entity-link" >PaymentMethodResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaymentPeriodInterface.html" data-type="entity-link" >PaymentPeriodInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaymentPeriodResults.html" data-type="entity-link" >PaymentPeriodResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaymentPeriodStatusInterface.html" data-type="entity-link" >PaymentPeriodStatusInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaymentPeriodStatusResults.html" data-type="entity-link" >PaymentPeriodStatusResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PendingVoucherInterface.html" data-type="entity-link" >PendingVoucherInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PendingVoucherResults.html" data-type="entity-link" >PendingVoucherResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PeriodInterface.html" data-type="entity-link" >PeriodInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PeriodResults.html" data-type="entity-link" >PeriodResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PersonInterface.html" data-type="entity-link" >PersonInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PersonResults.html" data-type="entity-link" >PersonResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RelatedData.html" data-type="entity-link" >RelatedData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RelatedData-1.html" data-type="entity-link" >RelatedData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RelatedData-2.html" data-type="entity-link" >RelatedData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ScopeBalanceSummary.html" data-type="entity-link" >ScopeBalanceSummary</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ScopeInterface.html" data-type="entity-link" >ScopeInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ScopeResults.html" data-type="entity-link" >ScopeResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SellerCommissionResults.html" data-type="entity-link" >SellerCommissionResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SellerCommissionSummary.html" data-type="entity-link" >SellerCommissionSummary</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SessionData.html" data-type="entity-link" >SessionData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StatusPeriodInterface.html" data-type="entity-link" >StatusPeriodInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StatusPeriodResults.html" data-type="entity-link" >StatusPeriodResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TransactionInterface.html" data-type="entity-link" >TransactionInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TransactionResults.html" data-type="entity-link" >TransactionResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TreeInterface.html" data-type="entity-link" >TreeInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TreeResults.html" data-type="entity-link" >TreeResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TypeCardInterface.html" data-type="entity-link" >TypeCardInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TypeCardResults.html" data-type="entity-link" >TypeCardResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TypeOperationInterface.html" data-type="entity-link" >TypeOperationInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TypeOperationResults.html" data-type="entity-link" >TypeOperationResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VoucherFeeInterface.html" data-type="entity-link" >VoucherFeeInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VoucherFeeResults.html" data-type="entity-link" >VoucherFeeResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VoucherFeeStatusInterface.html" data-type="entity-link" >VoucherFeeStatusInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VoucherFeeStatusInterfaceResults.html" data-type="entity-link" >VoucherFeeStatusInterfaceResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VoucherInterface.html" data-type="entity-link" >VoucherInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VoucherResults.html" data-type="entity-link" >VoucherResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VoucherStateInterface.html" data-type="entity-link" >VoucherStateInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VoucherStateResults.html" data-type="entity-link" >VoucherStateResults</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscelánea</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Alias de tipo</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Rutas</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Cobertura de la documentación</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentación generada utilizando <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});
