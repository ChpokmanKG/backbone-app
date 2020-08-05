const app = {};

app.User = Backbone.Model.extend({
  defaults: {
    name: '',
    phoneNumber: '',
    isChanging: false,
    error: '',
  },
  toggle: function() {
    this.save({isChanging: !this.get('isChanging')});
  }
})


app.UserList = Backbone.Collection.extend({
  model: app.User,
  localStorage: new Store("users-list")
})

app.userList = new app.UserList();

app.UserView = Backbone.View.extend({
  tagName: "tr",
  template: _.template(document.getElementById('item-template').innerHTML),
  initialize: function() {
    this.model.on('change', this.render, this);
    this.model.on('destroy', this.remove, this);
  },
  render() {
    this.el.innerHTML = this.template(this.model.toJSON()); 
    this.name = this.model.attributes.name
    this.phoneNumber = this.model.attributes.phoneNumber;
    return this;
  },
  events: {
    'click .btn-danger': 'destroy',
    'click .btn-warning': 'edit',
    'click .btn-success': 'checkAndSave'
  },
  destroy() {
    this.model.destroy();
  },
  edit() {
    this.model.toggle();
    this.model.set({
      error: ""
    })
  },
  checkAndSave() {
    const re = /[A-Za-zА-Яа-я\d]*[A-Za-zА-Яа-я][A-Za-zА-Яа-я\d]*/;
    const name = this.$('#userChange').val();
    const phoneNumber = this.$('#phoneNumberChange').val();
    const valid = re.test(phoneNumber);

    if(!valid && name.length >= 3) {
      this.model.save({
        name,
        phoneNumber,
        isChanging: false
      })
    }else {
      this.model.set({
        isChanging: false,
        error: "Проверьте правильнность введных данных"
      })
    }
  },
})


app.AppView = Backbone.View.extend({
  el: "#user-app",
  initialize() {
    this.nameInput = this.$('#nameInput');
    this.phoneInput = this.$('#phoneNumberNumber');
    app.userList.on('add',this.addOne,this);
    app.userList.fetch()
  },
  events: {
    'submit #main-form': 'formEvent'
  },
  formEvent(e) {
    e.preventDefault();

    app.userList.create({
      name: this.nameInput.val(),
      phoneNumber: this.phoneInput.val(),
      isChanging: false
    })

    this.nameInput.val("");
    this.phoneInput.val("");

  },
  addOne(user){
    const userView = new app.UserView({model: user});
    const usersWrap = document.getElementById('users');
    const usersWrapFirstChild = usersWrap.firstChild;
    usersWrap.insertBefore(userView.render().el,usersWrapFirstChild);
  }
})

app.appView = new app.AppView();