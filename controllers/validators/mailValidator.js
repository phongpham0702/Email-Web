const {check} = require('express-validator')
const sanitizeHtml = require('sanitize-html')

const mailValidator = [


    check('To').exists().withMessage('Missing receiver ID')
    .custom((value, {req}) => {
        
        if (!value && !req.body.cc && !req.body.bcc) {
            throw new Error('Please enter at least 1 receiver ID to send mail');
          }
          return true;
    })
    ,

    check('Subject').exists().withMessage('Please enter your subject')
    .notEmpty().withMessage('Please enter your subject')
    ,

    check('Content').exists().withMessage('Please enter your content')
    .notEmpty().withMessage('Please enter your content')
    .custom((value) => {
        sanitizedEmail = sanitizeHtml(value);
        console.log(sanitizedEmail);
        if (value !== sanitizedEmail) {
          throw new Error('Your mail content is not allowed');
        }
        return true;
    })
    ,
]

module.exports = mailValidator