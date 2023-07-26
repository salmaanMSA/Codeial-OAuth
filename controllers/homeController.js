
// render home page
module.exports.viewHome = function(req, res){
    if (req.isAuthenticated()){
        return res.render('home', {title: "CAuth"});
    }
    return res.redirect('users/signin')
}