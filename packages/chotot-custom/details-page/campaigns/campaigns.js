const moneyFormated = (number) => {
  return number ? number.toString().replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.') : 'N/A';
};

const itemPriceOld = (priceListOld, currentItem) => {
  if (priceListOld) {
    for (let i = 0; i < priceListOld.length; i++) {
      const priceItem = priceListOld[i];
      let check = true;
      const keys = Object.keys(currentItem);
      for (let j = 0; j < keys.length; j++) {
        if (currentItem[keys[j]] && priceItem[keys[j]] && keys[j] !== 'price' && `${priceItem[keys[j]]}` !== `${currentItem[keys[j]]}`) {
          check = false;
          break;
        }
      }
      if (check) {
        return priceItem;
      }
    }
  }
  return {};
};

const reloadData = (tpl) => {
  const id = Router.current().params.id;
  BaseTemplate.of().post("GetById", id, function (err, res) {
    if (!err) {
      tpl.rawData.set(formatPrice(res));
    }
  });
}

const formatPrice = (data) => {
  if (data.price_list) {
    const keys = Object.keys(data.price_list);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const priceList = data.price_list[key];
      const priceListOld = data.price_current[key];
      for (let j = 0; j < priceList.length; j++) {
        const dataPriceOld = itemPriceOld(priceListOld, priceList[j]);
        data.price_list[key][j].price_vnd = moneyFormated(parseInt(priceList[j].price.vnd, 10));
        data.price_list[key][j].price_credit = moneyFormated(parseInt(priceList[j].price.credit, 10));
        data.price_list[key][j].price_promotion = moneyFormated(parseInt(priceList[j].price.promotion, 10));
        if (dataPriceOld.price) {
          data.price_list[key][j].price_old_vnd = moneyFormated(parseInt(dataPriceOld.price.vnd, 10));
          data.price_list[key][j].price_old_credit = moneyFormated(parseInt(dataPriceOld.price.credit, 10));
        }
      }
    }
  }
  return data;
};

Template.vCampaignDetail.onCreated(function () {
  this.rawData = new ReactiveVar();
  const id = Router.current().params.id;
  const self = this;
  BaseTemplate.of().post("GetById", id, function (err, res) {
    if (!err) {
      self.rawData.set(formatPrice(res));
    }
  });
})

Template.vCampaignDetail.onRendered(function () {
  setTimeout(() => {
    $('.table-detail-campaign-price').DataTable();
  }, 3000);
})

Template.vCampaignDetail.helpers({
  'data': function () {
    return Template.instance().rawData.get();
  },
  'isActive': function() {
    const data = Template.instance().rawData.get();
    return data && data.status != 0;
  },
  'noPriceList': function() {
    const data = Template.instance().rawData.get();
    return (data && !data.price_list) || (data && data.price_list && Object.keys(data.price_list).length === 0);
  },
  'hasBump': function() {
    const data = Template.instance().rawData.get();
    return data && data.price_list && data.price_list.bump && data.price_list.bump.length > 0;
  },
  'hasStickyAds': function() {
    const data = Template.instance().rawData.get();
    return data && data.price_list && data.price_list.sticky_ads && data.price_list.sticky_ads.length > 0;
  },
  'hasGalleyAds': function() {
    const data = Template.instance().rawData.get();
    return data && data.price_list && data.price_list.gallery_ads && data.price_list.gallery_ads.length > 0;
  },
  'hasAdFeatures': function() {
    const data = Template.instance().rawData.get();
    return data && data.price_list && data.price_list.ad_features && data.price_list.ad_features.length > 0;
  },
  'hasInsertAds': function() {
    const data = Template.instance().rawData.get();
    return data && data.price_list && data.price_list.insert_ads && data.price_list.insert_ads.length > 0;
  },
  'hasInsertAdsWithRegions': function() {
    const data = Template.instance().rawData.get();
    return data && data.price_list && data.price_list.insert_ads_with_regions && data.price_list.insert_ads_with_regions.length > 0;
  },
  'hasBundles': function() {
    const data = Template.instance().rawData.get();
    return data && data.price_list && data.price_list.bundles && data.price_list.bundles.length > 0;
  }
})

Template.vCampaignDetail.events({
  'click .btn-approve-price-campaign': function(e, tpl) {
    e.preventDefault();
    const campaignId = Router.current().params.id;
    const { price_id, service_type } = e.currentTarget.dataset;
    BaseTemplate.of().post("ApprovePriceCampaign", {id: campaignId, price_id: price_id, service_type: service_type}, function(err, res) {
      if (!err) {
        reloadData(tpl);
      }
    });
  },
  'click .btn-reject-price-campaign': function(e, tpl) {
    e.preventDefault();
    const campaignId = Router.current().params.id;
    const { price_id, service_type } = e.currentTarget.dataset;
    BaseTemplate.of().post("RejectPriceCampaign", {id: campaignId, price_id: price_id, service_type: service_type}, function(err, res) {
      if (!err) {
        reloadData(tpl);
      }
    });
  },
  'click .btn-delete-price-campaign': function(e, tpl) {
    e.preventDefault();
    const campaignId = Router.current().params.id;
    const { price_id, service_type } = e.currentTarget.dataset;
    swal({
        title: "Bạn chắc chưa?",
        text: "Bạn có muốn xoá giá dịch vụ này!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Okie, xoá luôn!",
        closeOnConfirm: false
    }, function () {
      BaseTemplate.of().post("DeletePriceCampaign", {id: campaignId, price_id: price_id, service_type: service_type}, function(err, res) {
        if (!err) {
          reloadData(tpl);
        }
      });
      swal("Đã xoá nhe!", "Giá dịch vụ đã được xoá thành công.", "success");
    });
  },
  'click .btn-accept-all-price': function(e, tpl) {
    e.preventDefault();
    const campaignId = Router.current().params.id;
    BaseTemplate.of().post("AcceptAllPriceCampaign", {id: campaignId}, function(err, res) {
      if (!err) {
        swal("Thành công!", "Giá dịch vụ đã được chấp nhận.", "success");
        reloadData(tpl);
      }
    });
  },
  'click .btn-reject-all-price': function(e, tpl) {
    e.preventDefault();
    const campaignId = Router.current().params.id;
    BaseTemplate.of().post("RejectAllPriceCampaign", {id: campaignId}, function(err, res) {
      if (!err) {
        swal("Thành công!", "Giá dịch vụ đã bị từ chối.", "success");
        reloadData(tpl);
      }
    });
  },
  'click .btn-accept-campaign': function(e, tpl) {
    e.preventDefault();
    const campaignId = Router.current().params.id;
    BaseTemplate.of().post("PublicPriceCampaign", {id: campaignId}, function(err, res) {
      if (!err) {
        swal("Thành công!", "Giá dịch vụ đã được áp dụng thành công.", "success");
        reloadData(tpl);
      }
    });
  },
  'click .btn-start-campaign': function(e, tpl) {
    e.preventDefault();
    const campaignId = Router.current().params.id;
    BaseTemplate.of().post("StartCampaign", {id: campaignId}, function(err, res) {
      if (!err) {
        swal("Thành công!", "Campaign đã được start.", "success");
        reloadData(tpl);
      }
    });
  },
  'click .btn-stop-campaign': function(e, tpl) {
    e.preventDefault();
    const campaignId = Router.current().params.id;
    BaseTemplate.of().post("StopCampaign", {id: campaignId}, function(err, res) {
      if (!err) {
        swal("Thành công!", "Campaign đã được stop.", "success");
        reloadData(tpl);
      }
    });
  },
  'submit .modal-body form': function(e, tpl) {
    e.preventDefault();
    const formId = e.currentTarget.id;
    const priceVnd = tpl.$(`#${formId} input[name=price_vnd]`).val();
    const priceCredit = tpl.$(`#${formId} input[name=price_credit]`).val();
    const campaignId = Router.current().params.id;
    const serviceType = tpl.$(`#${formId} input[name=service_type]`).val();
    const priceId = tpl.$(`#${formId} input[name=price_id]`).val();
    const dataPost = {
      id: campaignId,
      price_id: priceId,
      service_type: serviceType,
      price_vnd: priceVnd,
      price_credit: priceCredit
    };
    BaseTemplate.of().post("EditPriceCampaign", dataPost, function(err, res) {
      if (!err) {
        tpl.$('.btn-close-modal').trigger('click');
        reloadData(tpl);
      }
    });
  }
})
