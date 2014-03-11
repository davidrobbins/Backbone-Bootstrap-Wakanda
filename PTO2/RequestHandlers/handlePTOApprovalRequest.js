﻿function ptoApproval(request, response) {	try {		var params = request.rawURL.split("/"),	        requestID = params[2],	        approvePassword = params[3],	        approveID = params[4],	        approvalString = params[5],	        ha1 = directory.computeHA1(approveID, approvePassword),	        //sessionRef = currentSession(), // Get session.	        promoteToken = currentSession().promoteWith("Internal"), //temporarily make this session Internal level.	        	        requestorName = null,	      	requestorID = null,	        returnMessage = "",	        requestorResponseMessage = "",	        html = "";	                            		response.contentType = 'text/html';				new ds.Log({        	createDate: new Date(),             kind: "handlePTORequest one",            requestId: requestID,            dataClassName: requestID        }).save();   						var requestToApprove = ds.Request(requestID);				new ds.Log({        	createDate: new Date(),             kind: "handlePTORequest two",            requestId: requestID,            dataClassName: requestID        }).save();                   						if (requestToApprove) {						new ds.Log({	        	createDate: new Date(), 	            kind: "handlePTORequest three",	            requestId: requestID,	            dataClassName: requestID	        }).save();   			        			requestorName = requestToApprove.owner.fullName;	      	requestorID = requestToApprove.owner.id;	      				if (ha1 === requestToApprove.approveHA1Key) {								new ds.Log({		        	createDate: new Date(), 		            kind: "handlePTORequest four",		            requestId: requestID,		            dataClassName: requestID,		            message: approvalString		        }).save();   	        				if (approvalString === "approve") {					requestorResponseMessage = "Approved";					requestToApprove.status = "Approved";															new ds.Log({			        	createDate: new Date(), 			            kind: "handlePTORequest five",			            requestId: requestID,			            dataClassName: requestID			        }).save();           					requestToApprove.save();										new ds.Log({			        	createDate: new Date(), 			            kind: "handlePTORequest six",			            requestId: requestID,			            dataClassName: requestID			        }).save();   			        			        					html += "Status set to <strong>Approved</strong> for request: " + requestID + ".<br/>";					html += "Requestor: " + requestorName + ".</br></br>";					html += "Request details: <br/>"; //+ requestToApprove.hours + "/" + requestToApprove.compensation + "/" + requestToApprove.dateString;					html += "Hours: " + requestToApprove.hours + ".</br>";					html += "Compensation Method: " + requestToApprove.compensation + ".</br>";					html += "Date Requested: " + requestToApprove.dateString + ".</br>";										new ds.Log({			        	createDate: new Date(), 			            kind: "handlePTORequest seven",			            requestId: requestID,			            dataClassName: requestID			        }).save();   			        			        								} else if (approvalString === "reject") {					requestorResponseMessage = "Rejected";					requestToApprove.status = "Rejected";					requestToApprove.save();					html += "Status set to <strong>Rejected</strong> for request: " + requestID + ".<br/>";					html += "Requestor: " + requestorName + ".</br></br>";					html += "Request details: <br/>"; //+ requestToApprove.hours + "/" + requestToApprove.compensation + "/" + requestToApprove.dateString;					html += "Hours: " + requestToApprove.hours + ".</br>";					html += "Compensation Method: " + requestToApprove.compensation + ".</br>";					html += "Date Requested: " + requestToApprove.dateString + ".</br>";				} else {					html += "<h3>Could not recognize the requested operation. The status of Request: " + requestID + "was not changed.</h3>";				}							} else {				html += "<h3>Could not authorize you to update the status of this request.</h3>";			} //end - (ha1 === requestToApprove.approveHA1Key)									new ds.Log({	        	createDate: new Date(), 	            kind: "handlePTORequest eight",	            requestId: requestID,	            dataClassName: requestID	        }).save();   			        			//Employee has requesting PTO. Send back status of approval.		    var theEmailWorker = new SharedWorker("sharedWorkers/emailDaemon.js", "emailDaemon"),		    	thePort = theEmailWorker.port; // MessagePort to communicate with the email shared worker.			thePort.postMessage({				what: 'statusPTOSendMail',				requestStatus: requestorResponseMessage, // approvalString				requestID: requestID,				requestorID: requestorID,				hours: requestToApprove.hours,				comp: requestToApprove.compensation,				dateString: requestToApprove.dateString			});						new ds.Log({	        	createDate: new Date(), 	            kind: "handlePTORequest nine",	            requestId: requestID,	            dataClassName: requestID	        }).save();   	        	        		}  else {			//request does not exist. User may have withdrawn it.			html += "<h3>Could not find Request: " + requestID + ". It may have been withdrawn.</h3>";		}//end - if (requestToApprove).			    return html;				currentSession().unPromote(promoteToken); //put the session back to normal.			} catch (e) { //e.message		new ds.Log({        	createDate: new Date(),             kind: "handlePTORequest",                        message: e.message,            line: err.line,			name: err.name,			sourceID: err.sourceID,			sourceURL: err.sourceURL,		            dataClassName: null,            eventName: null,            entity_toJSON: null,            old_entity_toJSON: null,            userName: null,            userId: null,            requestId: null,            ownerName: null        }).save();   	}		/*	new ds.Log({		createDate: new Date(), 		message: err.message,		line: err.line,		name: err.name,		sourceID: err.sourceID,		sourceURL: err.sourceURL	}).save();		*/			} //end - function ptoApproval